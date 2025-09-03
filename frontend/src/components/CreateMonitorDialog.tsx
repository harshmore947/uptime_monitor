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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useMonitorStore } from "@/stores/monitor-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Monitor, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface CreateMonitorFormData {
  name: string;
  url: string;
  type: "http" | "https" | "tcp" | "ping";
  interval: number;
  timeout: number;
  retries: number;
  method: string;
  expectedStatusCode: number;
  customHeaders: { key: string; value: string }[];
}

interface CreateMonitorDialogProps {
  children?: React.ReactNode;
}

export function CreateMonitorDialog({ children }: CreateMonitorDialogProps) {
  const [open, setOpen] = useState(false);
  const { createMonitor, isLoading } = useMonitorStore();
  const { fetchDashboard } = useDashboardStore();

  const form = useForm<CreateMonitorFormData>({
    defaultValues: {
      name: "",
      url: "",
      type: "http",
      interval: 60,
      timeout: 30,
      retries: 3,
      method: "GET",
      expectedStatusCode: 200,
      customHeaders: [],
    },
  });

  const onSubmit = async (data: CreateMonitorFormData) => {
    try {
      await createMonitor(data);
      await fetchDashboard(); // Refresh dashboard stats
      toast.success("Monitor created successfully!");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create monitor. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Monitor className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Monitor</DialogTitle>
          <DialogDescription>
            Add a new service to monitor. We'll check its availability at
            regular intervals.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Monitor name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monitor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Website" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this monitor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              rules={{
                required: "URL is required",
                pattern: {
                  value:
                    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: "Please enter a valid URL",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL or IP address to monitor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monitor Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select monitor type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="https">HTTPS</SelectItem>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="ping">Ping</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of check to perform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="interval"
                rules={{
                  required: "Interval is required",
                  min: { value: 30, message: "Minimum 30 seconds" },
                  max: { value: 3600, message: "Maximum 1 hour" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval (sec)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeout"
                rules={{
                  required: "Timeout is required",
                  min: { value: 5, message: "Minimum 5 seconds" },
                  max: { value: 300, message: "Maximum 5 minutes" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout (sec)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retries"
                rules={{
                  required: "Retries is required",
                  min: { value: 1, message: "Minimum 1 retry" },
                  max: { value: 10, message: "Maximum 10 retries" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retries</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select HTTP method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The HTTP method to use for the request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedStatusCode"
              rules={{
                required: "Expected status code is required",
                min: {
                  value: 100,
                  message: "Status code must be at least 100",
                },
                max: { value: 599, message: "Status code must be at most 599" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Status Code</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="200"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The expected HTTP status code for a successful response
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Custom Headers</FormLabel>
              <FormDescription>
                Add custom headers to include in the request
              </FormDescription>
              {form.watch("customHeaders").map((_, index) => (
                <div key={index} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`customHeaders.${index}.key`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Header name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`customHeaders.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Header value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentHeaders = form.getValues("customHeaders");
                      form.setValue(
                        "customHeaders",
                        currentHeaders.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentHeaders = form.getValues("customHeaders");
                  form.setValue("customHeaders", [
                    ...currentHeaders,
                    { key: "", value: "" },
                  ]);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </div>

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
                {isLoading ? "Creating..." : "Create Monitor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
