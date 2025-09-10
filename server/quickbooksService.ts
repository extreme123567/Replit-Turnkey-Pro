import QuickBooks from 'node-quickbooks';
import OAuthClient from 'intuit-oauth';

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  redirectUri: string;
}

export interface QuickBooksTokens {
  accessToken: string;
  refreshToken: string;
  companyId: string;
  expiresAt: Date;
}

export interface InvoiceLineItem {
  amount: number;
  description: string;
  itemName: string;
  quantity?: number;
  unitPrice?: number;
}

export interface CreateInvoiceRequest {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  lineItems: InvoiceLineItem[];
  dueDate?: string;
  invoiceNumber?: string;
  memo?: string;
}

export class QuickBooksService {
  private oauthClient: OAuthClient;
  private qbClient: QuickBooks | null = null;
  private config: QuickBooksConfig;

  constructor(config: QuickBooksConfig) {
    this.config = config;
    this.oauthClient = new OAuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      environment: config.environment,
      redirectUri: config.redirectUri,
    });
  }

  // Generate authorization URL for OAuth flow
  getAuthorizationUrl(): string {
    return this.oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      access_type: 'offline',
    });
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(authorizationCode: string, realmId: string): Promise<QuickBooksTokens> {
    try {
      const authResponse = await this.oauthClient.createToken(authorizationCode);
      const token = authResponse.getToken();
      
      return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        companyId: realmId,
        expiresAt: new Date(Date.now() + (token.expires_in * 1000)),
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<QuickBooksTokens> {
    try {
      this.oauthClient.setToken({
        refresh_token: refreshToken,
      });
      
      const authResponse = await this.oauthClient.refresh();
      const token = authResponse.getToken();
      
      return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        companyId: '', // Will be set from stored value
        expiresAt: new Date(Date.now() + (token.expires_in * 1000)),
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Initialize QuickBooks client with tokens
  initializeClient(tokens: QuickBooksTokens): void {
    this.qbClient = new QuickBooks(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri,
      tokens.accessToken,
      tokens.companyId,
      this.config.environment === 'sandbox',
      65, // Minor version
      '2.0', // OAuth version
      tokens.refreshToken
    );
  }

  // Create customer in QuickBooks
  async createCustomer(name: string, email?: string, address?: any): Promise<any> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    return new Promise((resolve, reject) => {
      const customerData: any = {
        Name: name,
      };

      if (email) {
        customerData.PrimaryEmailAddr = { Address: email };
      }

      if (address) {
        customerData.BillAddr = address;
      }

      this.qbClient!.createCustomer(customerData, (err: any, customer: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(customer.QueryResponse.Customer[0]);
        }
      });
    });
  }

  // Get existing customers
  async getCustomers(): Promise<any[]> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    return new Promise((resolve, reject) => {
      this.qbClient!.findCustomers((err: any, customers: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(customers.QueryResponse?.Customer || []);
        }
      });
    });
  }

  // Create item for invoicing
  async createItem(name: string, unitPrice: number, description?: string): Promise<any> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    return new Promise((resolve, reject) => {
      const itemData = {
        Name: name,
        Type: 'Service',
        UnitPrice: unitPrice,
        IncomeAccountRef: {
          value: '1', // Default income account
        },
      };

      if (description) {
        (itemData as any).Description = description;
      }

      this.qbClient!.createItem(itemData, (err: any, item: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(item.QueryResponse.Item[0]);
        }
      });
    });
  }

  // Create invoice in QuickBooks
  async createInvoice(invoiceRequest: CreateInvoiceRequest): Promise<any> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    return new Promise((resolve, reject) => {
      const lines = invoiceRequest.lineItems.map((item, index) => ({
        Id: (index + 1).toString(),
        LineNum: index + 1,
        Amount: item.amount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: '1', // Default service item - should be created or mapped
            name: item.itemName,
          },
          Qty: item.quantity || 1,
          UnitPrice: item.unitPrice || item.amount,
        },
        Description: item.description,
      }));

      const invoiceData: any = {
        Line: lines,
        CustomerRef: {
          value: invoiceRequest.customerId,
        },
      };

      if (invoiceRequest.customerEmail) {
        invoiceData.BillEmail = {
          Address: invoiceRequest.customerEmail,
        };
      }

      if (invoiceRequest.dueDate) {
        invoiceData.DueDate = invoiceRequest.dueDate;
      }

      if (invoiceRequest.memo) {
        invoiceData.CustomerMemo = {
          value: invoiceRequest.memo,
        };
      }

      if (invoiceRequest.invoiceNumber) {
        invoiceData.DocNumber = invoiceRequest.invoiceNumber;
      }

      this.qbClient!.createInvoice(invoiceData, (err: any, invoice: any) => {
        if (err) {
          console.error('QuickBooks invoice creation error:', err);
          reject(err);
        } else {
          resolve(invoice.QueryResponse.Invoice[0]);
        }
      });
    });
  }

  // Get company information
  async getCompanyInfo(): Promise<any> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    return new Promise((resolve, reject) => {
      this.qbClient!.getCompanyInfo('1', (err: any, companyInfo: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(companyInfo.QueryResponse.CompanyInfo[0]);
        }
      });
    });
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getCompanyInfo();
      return true;
    } catch (error) {
      console.error('QuickBooks connection test failed:', error);
      return false;
    }
  }

  // Find existing invoice by DocNumber (idempotency)
  async findInvoiceByDocNumber(docNumber: string): Promise<any | null> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    return new Promise((resolve, reject) => {
      const query = `select * from Invoice where DocNumber = '${docNumber.replace(/'/g, "''")}'`;
      (this.qbClient as any).query(query, (err: any, result: any) => {
        if (err) {
          return reject(err);
        }
        const invoices = result?.QueryResponse?.Invoice || [];
        resolve(invoices.length > 0 ? invoices[0] : null);
      });
    });
  }

  // Get unpaid and overdue summary
  async getUnpaidSummary(): Promise<{ count: number; totalBalance: number; overdueCount: number; overdueBalance: number; asOf: string; }> {
    if (!this.qbClient) {
      throw new Error('QuickBooks client not initialized');
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const runQuery = (q: string) => new Promise<any>((resolve, reject) => {
      (this.qbClient as any).query(q, (err: any, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const unpaidQuery = `select Id, Balance from Invoice where Balance > 0`;
    const overdueQuery = `select Id, Balance from Invoice where Balance > 0 and DueDate < '${todayStr}'`;

    const [unpaidRes, overdueRes] = await Promise.all([
      runQuery(unpaidQuery),
      runQuery(overdueQuery)
    ]);

    const unpaidInvoices: any[] = unpaidRes?.QueryResponse?.Invoice || [];
    const overdueInvoices: any[] = overdueRes?.QueryResponse?.Invoice || [];

    const totalBalance = unpaidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.Balance) || 0), 0);
    const overdueBalance = overdueInvoices.reduce((sum, inv) => sum + (parseFloat(inv.Balance) || 0), 0);

    return {
      count: unpaidInvoices.length,
      totalBalance,
      overdueCount: overdueInvoices.length,
      overdueBalance,
      asOf: today.toISOString(),
    };
  }
}