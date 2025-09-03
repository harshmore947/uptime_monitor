import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useIncidentStore } from "@/stores/incident-store";
import { useMonitorStore } from "@/stores/monitor-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateIncidentFormData {
  monitorId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface CreateIncidentDialogProps {
  children?: React.ReactNode;
}

export function CreateIncidentDialog({ children }: CreateIncidentDialogProps) {
  const [open, setOpen] = useState(false);
  const { createIncident, isLoading } = useIncidentStore();
  const { monitors } = useMonitorStore();
  const { fetchDashboard } = useDashboardStore();

  const form = useForm<CreateIncidentFormData>({
    defaultValues: {
      monitorId: "",
      title: "",
      description: "",
      severity: "medium",
    },
  });

  const onSubmit = async (data: CreateIncidentFormData) => {
    try {
      await createIncident(data.monitorId, {
        title: data.title,
        description: data.description,
        severity: data.severity,
      });
      toast.success("Incident created successfully!");
      await fetchDashboard(); // Refresh dashboard stats after incident creation
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create incident. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Incident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
          <DialogDescription>
            Report a new incident for one of your monitored services.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monitorId"
              rules={{ required: "Please select a monitor" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affected Monitor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select affected monitor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monitors.map((monitor) => (
                        <SelectItem key={monitor._id} value={monitor._id}>
                          {monitor.name} - {monitor.url}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose which monitor this incident affects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Incident title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Service Down" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief, descriptive title for the incident
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Incident description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident details..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the incident
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                          Critical
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How severe is this incident?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Incident"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
