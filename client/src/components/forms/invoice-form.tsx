import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInvoiceSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertInvoice, Client, Job } from "@shared/schema";

type InvoiceFormValues = {
  clientId: string;
  jobId?: string;
  amount: string;
  tax?: string;
  total: string;
  status?: string;
  issueDate: string; // yyyy-MM-dd
  dueDate: string;   // yyyy-MM-dd
  notes?: string;
};

interface InvoiceFormProps {
  onSuccess?: () => void;
  initialData?: Partial<InsertInvoice>;
}

export function InvoiceForm({ onSuccess, initialData }: InvoiceFormProps) {
  const { toast } = useToast();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      clientId: (initialData?.clientId as string | undefined) || "",
      jobId: (initialData?.jobId as string | undefined) || "",
      amount: (initialData?.amount as unknown as string | undefined) || "",
      tax: (initialData?.tax as unknown as string | undefined) || "0.00",
      total: (initialData?.total as unknown as string | undefined) || "",
      status: (initialData?.status as string | undefined) || "draft",
      issueDate: initialData?.issueDate ? new Date(initialData.issueDate as any).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate as any).toISOString().split('T')[0] : (() => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        return dueDate.toISOString().split('T')[0];
      })(),
      notes: (initialData?.notes as string | undefined) || "",
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Watch amount and tax to calculate total
  const amount = form.watch("amount");
  const tax = form.watch("tax");

  // Update total when amount or tax changes
  React.useEffect(() => {
    const amountNum = parseFloat(amount || "0");
    const taxNum = parseFloat(tax || "0");
    const total = amountNum + taxNum;
    form.setValue("total", total.toFixed(2));
  }, [amount, tax, form]);

  const onSubmit = (values: InvoiceFormValues) => {
    const invoiceData: InsertInvoice = {
      clientId: values.clientId,
      jobId: values.jobId ? values.jobId : undefined,
      amount: values.amount,
      tax: values.tax ?? undefined,
      total: values.total,
      status: values.status ?? "draft",
      issueDate: new Date(values.issueDate),
      dueDate: new Date(values.dueDate),
      notes: values.notes ?? undefined,
    } as InsertInvoice;
    createInvoiceMutation.mutate(invoiceData);
  };

  const getClientJobs = (clientId: string) => {
    return jobs?.filter(job => job.clientId === clientId) || [];
  };

  const selectedClientId = form.watch("clientId");
  const availableJobs = getClientJobs(selectedClientId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-invoice-client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Job (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-invoice-job">
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No specific job</SelectItem>
                    {availableJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - ${job.amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="450.00" 
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    data-testid="input-invoice-amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="36.00" 
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    data-testid="input-invoice-tax"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={field.value ?? ""}
                    readOnly
                    className="bg-slate-50"
                    data-testid="input-invoice-total"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-invoice-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    data-testid="input-invoice-issue-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    data-testid="input-invoice-due-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Additional notes or terms..." 
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    data-testid="textarea-invoice-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="servicepro-btn-primary"
            disabled={createInvoiceMutation.isPending}
            data-testid="button-save-invoice"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
