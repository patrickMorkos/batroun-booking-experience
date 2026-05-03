import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import type { ChaletWithImages } from "@/types/database";

const chaletSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  tagline: z.string().min(1, "Tagline is required"),
  capacity: z.string().optional(),
  features: z.string(),
  weekday_price: z.coerce.number().min(0, "Price must be positive"),
  weekend_price: z.coerce.number().min(0, "Price must be positive"),
  check_in: z.string().min(1, "Check-in time is required"),
  check_out: z.string().min(1, "Check-out time is required"),
});

export type ChaletFormValues = z.infer<typeof chaletSchema>;

interface ChaletFormProps {
  chalet?: ChaletWithImages;
  onSubmit: (data: ChaletFormValues) => void;
  isSubmitting: boolean;
}

export default function ChaletForm({ chalet, onSubmit, isSubmitting }: ChaletFormProps) {
  const form = useForm<ChaletFormValues>({
    resolver: zodResolver(chaletSchema),
    defaultValues: {
      name: chalet?.name || "",
      slug: chalet?.slug || "",
      tagline: chalet?.tagline || "",
      capacity: chalet?.capacity || "",
      features: chalet?.features?.join("\n") || "",
      weekday_price: chalet?.weekday_price || 0,
      weekend_price: chalet?.weekend_price || 0,
      check_in: chalet?.check_in || "3:00 PM",
      check_out: chalet?.check_out || "11:00 AM",
    },
  });

  const generateSlug = () => {
    const name = form.getValues("name");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Ô Batroun 101" {...field} onBlur={() => { field.onBlur(); if (!form.getValues("slug")) generateSlug(); }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="o-batroun-101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input placeholder="Cozy studio with sea view" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input placeholder="4-5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Time</FormLabel>
                <FormControl>
                  <Input placeholder="3:00 PM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check_out"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out Time</FormLabel>
                <FormControl>
                  <Input placeholder="11:00 AM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="weekday_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekday Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weekend_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekend Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder={"Wi-Fi\nAir Conditioning\nKitchenette"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : chalet ? "Update Chalet" : "Create Chalet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
