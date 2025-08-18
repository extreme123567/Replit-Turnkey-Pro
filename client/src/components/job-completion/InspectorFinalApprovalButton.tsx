import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InspectorFinalApprovalButtonProps {
  workOrderId: string;
  jobTitle: string;
  currentStatus: string;
  inspectorId: string;
  techCompletedDate?: string;
  onApproved?: () => void;
}

export function InspectorFinalApprovalButton({ 
  workOrderId, 
  jobTitle, 
  currentStatus, 
  inspectorId,
  techCompletedDate,
  onApproved 
}: InspectorFinalApprovalButtonProps) {
  const [open, setOpen] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [finalStatus, setFinalStatus] = useState<"approved" | "callback" | "">("");
  const [callbackReason, setCallbackReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only show for jobs that are tech_completed
  if (currentStatus !== "tech_completed") {
    return null;
  }

  const finalApproveMutation = useMutation({
    mutationFn: async (data: {
      status: "inspector_approved" | "callback";
      notes: string;
      callbackReason?: string;
    }) => {
      const endpoint = data.status === "inspector_approved" 
        ? `/api/work-orders/${workOrderId}/inspector-approve`
        : `/api/work-orders/${workOrderId}/callback`;
        
      return apiRequest(endpoint, "PUT", {
        status: data.status,
        inspectorApprovedDate: data.status === "inspector_approved" ? new Date().toISOString() : null,
        inspectionNotes: data.notes,
        callbackReason: data.callbackReason,
        inspectorId: inspectorId
      });
    },
    onSuccess: (_, variables) => {
      const isApproved = variables.status === "inspector_approved";
      toast({
        title: isApproved ? "Job Approved" : "Callback Requested",
        description: isApproved 
          ? "Job has been given final approval and is 100% complete."
          : "Job has been sent back for additional work.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setOpen(false);
      setInspectionNotes("");
      setFinalStatus("");
      setCallbackReason("");
      onApproved?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process inspection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!finalStatus) {
      toast({
        title: "Status Required",
        description: "Please select whether to approve or request callback.",
        variant: "destructive",
      });
      return;
    }

    if (!inspectionNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide inspection notes.",
        variant: "destructive",
      });
      return;
    }

    if (finalStatus === "callback" && !callbackReason.trim()) {
      toast({
        title: "Callback Reason Required",
        description: "Please explain why a callback is needed.",
        variant: "destructive",
      });
      return;
    }

    finalApproveMutation.mutate({
      status: finalStatus === "approved" ? "inspector_approved" : "callback",
      notes: inspectionNotes,
      callbackReason: finalStatus === "callback" ? callbackReason : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          data-testid={`button-inspector-approval-${workOrderId}`}
        >
          <Shield className="mr-2" size={16} />
          Final Approval
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="text-purple-600" size={20} />
            <span>Inspector Final Approval</span>
          </DialogTitle>
          <DialogDescription>
            Review and provide final approval for "{jobTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {techCompletedDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tech Completed:</strong> {new Date(techCompletedDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div>
            <Label>Final Decision *</Label>
            <div className="flex space-x-2 mt-2">
              <Button
                variant={finalStatus === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFinalStatus("approved")}
                className={finalStatus === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                data-testid="button-approve"
              >
                <CheckCircle2 className="mr-1" size={16} />
                Approve (100% Complete)
              </Button>
              <Button
                variant={finalStatus === "callback" ? "default" : "outline"}
                size="sm"
                onClick={() => setFinalStatus("callback")}
                className={finalStatus === "callback" ? "bg-orange-600 hover:bg-orange-700" : ""}
                data-testid="button-callback"
              >
                <XCircle className="mr-1" size={16} />
                Request Callback
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="inspection-notes">Inspection Notes *</Label>
            <Textarea
              id="inspection-notes"
              placeholder="Quality assessment, completion verification, overall notes..."
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              className="mt-1"
              rows={3}
              data-testid="textarea-inspection-notes"
            />
          </div>

          {finalStatus === "callback" && (
            <div>
              <Label htmlFor="callback-reason">Callback Reason *</Label>
              <Textarea
                id="callback-reason"
                placeholder="Explain what needs to be fixed or redone..."
                value={callbackReason}
                onChange={(e) => setCallbackReason(e.target.value)}
                className="mt-1"
                rows={3}
                data-testid="textarea-callback-reason"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-inspection"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={finalApproveMutation.isPending}
              className={finalStatus === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
              data-testid="button-submit-inspection"
            >
              {finalApproveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {finalStatus === "approved" ? "Give Final Approval" : "Request Callback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}