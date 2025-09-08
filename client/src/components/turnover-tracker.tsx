import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TurnoverStats {
  totalTurnovers: number;
  turnoversThisMonth: number;
  turnoversThisYear: number;
  averageTurnoversPerProperty: number;
  propertiesTracked: number;
}

interface Property {
  id: string;
  name: string;
  units: number;
  address: string;
}

export function TurnoverTracker() {
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Fetch turnover statistics
  const { data: stats, isLoading: statsLoading } = useQuery<TurnoverStats>({
    queryKey: ["/api/turnovers/stats"],
    queryFn: async () => {
      return await apiRequest("/api/turnovers/stats", "GET");
    },
  });

  // Fetch properties for the dropdown
  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      return await apiRequest("/api/properties", "GET");
    },
  });

  // Record new turnover mutation
  const recordTurnoverMutation = useMutation({
    mutationFn: async (data: { propertyId: string; unitNumber: string; notes: string }) => {
      return await apiRequest("/api/turnovers", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Turnover Recorded",
        description: "Apartment turnover has been successfully recorded.",
      });
      // Reset form
      setSelectedProperty("");
      setUnitNumber("");
      setNotes("");
      setIsRecordDialogOpen(false);
      // Refresh stats
      queryClient.invalidateQueries({ queryKey: ["/api/turnovers/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record apartment turnover.",
        variant: "destructive",
      });
    },
  });

  const handleRecordTurnover = () => {
    if (!selectedProperty) {
      toast({
        title: "Error",
        description: "Please select a property.",
        variant: "destructive",
      });
      return;
    }

    recordTurnoverMutation.mutate({
      propertyId: selectedProperty,
      unitNumber,
      notes,
    });
  };

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Apartment Turnovers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading turnover data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Apartment Turnovers</span>
          </CardTitle>
          <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Record Turnover
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Apartment Turnover</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} - {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Unit Number (Optional)</label>
                  <Input
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="e.g., 2A, 101, etc."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this turnover..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleRecordTurnover}
                    disabled={recordTurnoverMutation.isPending}
                    className="flex-1"
                  >
                    {recordTurnoverMutation.isPending ? "Recording..." : "Record Turnover"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsRecordDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{stats?.totalTurnovers || 0}</p>
            <p className="text-sm text-blue-600">Total Turnovers</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{stats?.turnoversThisMonth || 0}</p>
            <p className="text-sm text-green-600">This Month</p>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-800">{stats?.turnoversThisYear || 0}</p>
            <p className="text-sm text-amber-600">This Year</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Home className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-800">
              {stats?.averageTurnoversPerProperty ? stats.averageTurnoversPerProperty.toFixed(1) : '0.0'}
            </p>
            <p className="text-sm text-purple-600">Avg per Property</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Properties Tracked</p>
              <p className="text-lg font-semibold text-slate-800">{stats?.propertiesTracked || 0} Properties</p>
            </div>
            <Badge variant="outline" className="text-slate-600">
              Live Tracking
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}