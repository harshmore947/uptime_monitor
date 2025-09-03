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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useStatusPageStore } from "@/stores/status-page-store";
import { useMonitorStore } from "@/stores/monitor-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateStatusPageFormData {
  name: string;
  description: string;
  monitors: string[];
  isPublic: boolean;
}

interface CreateStatusPageDialogProps {
  children?: React.ReactNode;
}

export function CreateStatusPageDialog({
  children,
}: CreateStatusPageDialogProps) {
  const [open, setOpen] = useState(false);
  const { createStatusPage, isLoading } = useStatusPageStore();
  const { monitors } = useMonitorStore();
  const { fetchDashboard } = useDashboardStore();

  const form = useForm<CreateStatusPageFormData>({
    defaultValues: {
      name: "",
      description: "",
      monitors: [],
      isPublic: false,
    },
  });

  const onSubmit = async (data: CreateStatusPageFormData) => {
    try {
      await createStatusPage(data);
      toast.success("Status page created successfully!");
      await fetchDashboard(); // Refresh dashboard stats after status page creation
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create status page. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Status Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Status Page</DialogTitle>
          <DialogDescription>
            Create a public status page to share your service status with
            customers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Status page name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Page Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Service Status" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name that will be displayed on your status page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your service..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short description that will appear on your status page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monitors"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Monitors to Include
                    </FormLabel>
                    <FormDescription>
                      Select which monitors to display on this status page
                    </FormDescription>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {monitors.map((monitor) => (
                      <FormField
                        key={monitor._id}
                        control={form.control}
                        name="monitors"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={monitor._id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(monitor._id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          monitor._id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== monitor._id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  {monitor.name}
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  {monitor.url}
                                </p>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make Public</FormLabel>
                    <FormDescription>
                      Allow anyone with the link to view this status page
                    </FormDescription>
                  </div>
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
                {isLoading ? "Creating..." : "Create Status Page"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
