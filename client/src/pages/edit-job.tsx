import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { usePageTitle } from "@/hooks/use-page-title";
import { Briefcase, ArrowLeft } from "lucide-react";
import { insertJobSchema, type InsertJob } from "@shared/schema";
import { Link } from "wouter";

export default function EditJobPage() {
  const [, params] = useRoute("/jobs/edit/:id");
  const [, navigate] = useLocation();
  const jobId = params?.id;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  usePageTitle("Edit Job");

  // Fetch job data
  const { data: job, isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
  });

  const form = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    values: job || undefined,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertJob>) => {
      return await apiRequest(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      toast({
        title: "Success",
        description: "Job updated successfully!",
      });
      navigate("/jobs");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success",
        description: "Job deleted successfully!",
      });
      navigate("/jobs");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertJob) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
              <p className="text-gray-400">You need to be logged in to edit jobs.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!job || job.ownerId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Not Found</h1>
              <p className="text-gray-400">This job doesn't exist or you don't have permission to edit it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Edit Job Posting</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your job posting details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Job Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Senior React Developer"
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Company *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Acme Inc."
                              className="bg-gray-800 border-gray-700 text-white"
                              data-testid="input-company"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Location *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Remote / San Francisco"
                              className="bg-gray-800 border-gray-700 text-white"
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Job Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white" data-testid="select-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="Full-time" className="text-white">Full-time</SelectItem>
                              <SelectItem value="Part-time" className="text-white">Part-time</SelectItem>
                              <SelectItem value="Contract" className="text-white">Contract</SelectItem>
                              <SelectItem value="Internship" className="text-white">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Salary *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="$100k - $150k"
                              className="bg-gray-800 border-gray-700 text-white"
                              data-testid="input-salary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the job role, responsibilities, and requirements..."
                            className="bg-gray-800 border-gray-700 text-white min-h-[150px]"
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="List the key requirements and qualifications..."
                            className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                            data-testid="textarea-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Contact Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="jobs@company.com"
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-update"
                    >
                      {updateMutation.isPending ? "Updating..." : "Update Job"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                      data-testid="button-delete"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete Job"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
