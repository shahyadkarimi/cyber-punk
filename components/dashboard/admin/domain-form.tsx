"use client";

import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Domain,
  DomainWithSeller,
} from "@/lib/database-services/domains-service";
import { toast } from "@/hooks/use-toast";
import { User } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { domainCategories } from "../domain-submission-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const domainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain name must be at least 3 characters")
    .refine((val) => {
      try {
        const url = new URL(`http://${val}`); // Check if it's a valid hostname
        return url.hostname === val && val.includes(".");
      } catch (e) {
        return false;
      }
    }, "Must be a valid domain name (e.g., example.com)"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null
        ? undefined
        : Number.parseFloat(String(val)),
    z
      .number({ invalid_type_error: "Price must be a number" })
      .positive("Price must be positive")
      .optional()
  ),
  status: z.enum(["pending", "approved", "rejected", "sold"]),
  seller_id: z.string().uuid("Invalid seller ID").optional().nullable(),
  admin_notes: z.string().optional(),
  da_score: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null
        ? undefined
        : Number.parseFloat(String(val)),
    z.number().min(0).max(100).optional()
  ),
  pa_score: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null
        ? undefined
        : Number.parseFloat(String(val)),
    z.number().min(0).max(100).optional()
  ),
  traffic: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null
        ? undefined
        : Number.parseInt(String(val), 10),
    z.number().int().min(0).optional()
  ),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

interface DomainFormProps {
  initialData?: Partial<DomainWithSeller> | null;
  onSubmit: (data: Partial<DomainWithSeller>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

export default function DomainForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  error,
}: DomainFormProps) {
  const [currentTags, setCurrentTags] = useState<string[]>(
    initialData?.tags || []
  );
  const [tagInput, setTagInput] = useState("");
  const [sellers, setSellers] = useState([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(false);
  const [activeTab, setActiveTab] = useState<string | "manuel" | "automatic">(
    "manuel"
  );
  const [shellUrl, setShellUrl] = useState<string>("");

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      domain: initialData?.domain || "",
      description: initialData?.description || null,
      price: initialData?.price || null,
      status: initialData?.status || "pending",
      seller_id: initialData?.seller?._id,
      admin_notes: initialData?.admin_notes || null,
      da_score: initialData?.da_score || null,
      pa_score: initialData?.pa_score || null,
      traffic: initialData?.traffic || null,
      category: initialData?.category || null,
      country: initialData?.country || null,
      premium: initialData?.premium || false,
      tags: initialData?.tags || [],
    },
  });

  useEffect(() => {
    if (!initialData) {
      reset({
        domain: "",
        description: "",
        price: null,
        status: "pending",
        seller_id: "",
        admin_notes: "",
        da_score: null,
        pa_score: null,
        traffic: null,
        category: "",
        country: "",
        premium: false,
        tags: [],
      });

      setCurrentTags([]);
    } else {
      setCurrentTags(initialData.tags || []);
    }
  }, [initialData, reset]);

  useEffect(() => {}, []);

  const handleTagAdd = () => {
    if (tagInput && !currentTags.includes(tagInput.trim())) {
      setCurrentTags([...currentTags, tagInput.trim()]);
      setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newData = currentTags.filter((tag) => tag !== tagToRemove);
    setValue("tags", newData);

    setCurrentTags(newData);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (value === "automatic") {
      reset({
        domain: "",
        description: "",
        price: null,
        status: "pending",
        seller_id: "",
        admin_notes: "",
        da_score: null,
        pa_score: null,
        traffic: null,
        category: "",
        country: "",
        premium: false,
        tags: [],
      });

      setCurrentTags([]);
    } else {
      reset({
        domain: initialData?.domain || "",
        description: initialData?.description || null,
        price: initialData?.price || null,
        status: initialData?.status || "pending",
        seller_id: initialData?.seller?._id,
        admin_notes: initialData?.admin_notes || null,
        da_score: initialData?.da_score || null,
        pa_score: initialData?.pa_score || null,
        traffic: initialData?.traffic || null,
        category: initialData?.category || null,
        country: initialData?.country || null,
        premium: initialData?.premium || false,
        tags: initialData?.tags || [],
      });

      setCurrentTags(initialData?.tags || []);
    }
  };

  const automaticFillForms = () => {
    
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-2"
    >
      <Tabs
        defaultValue="manuel"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4 bg-[#1a1a1a] border border-[#2a2a3a]">
          <TabsTrigger
            value="manuel"
            className="data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d]"
          >
            Manuel
          </TabsTrigger>
          <TabsTrigger
            value="automatic"
            className="data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d]"
          >
            Automatic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automatic" className="mt-0">
          <div>
            <Label htmlFor="shell" className="text-gray-300">
              Webshell
            </Label>
            <Input
              id="shell"
              value={shellUrl}
              onChange={(e) => setShellUrl(e.target.value)}
              className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
            {/* {errors.shell && (
              <p className="text-red-400 text-sm mt-1">
                {errors.shell.message}
              </p>
            )} */}
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert className="border-red-500/50 bg-red-500/10 mb-2">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="domain" className="text-gray-300">
          Domain Name
        </Label>
        <Input
          id="domain"
          {...register("domain")}
          className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
        />
        {errors.domain && (
          <p className="text-red-400 text-sm mt-1">{errors.domain.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="price" className="text-gray-300">
            Price ($)
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price")}
            className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          {errors.price && (
            <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="country" className="text-gray-300">
            Country
          </Label>
          <Input
            id="country"
            {...register("country")}
            className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          {errors.country && (
            <p className="text-red-400 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="status" className="text-gray-300">
            Status
          </Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d0d] border-[#2a2a3a] text-white">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>
      </div>
{/* 
      <div>
        <Label htmlFor="seller_id" className="text-gray-300">
          Seller
        </Label>
        <Controller
          name="seller_id"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value || ""} // Ensure value is not null for Select
              disabled={isLoadingSellers}
            >
              <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
                <SelectValue
                  placeholder={
                    isLoadingSellers
                      ? "Loading sellers..."
                      : "Select seller (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d0d] border-[#2a2a3a] text-white">
                <SelectItem value="none">None (Platform Owned)</SelectItem>
                {sellers.map((seller: User) => (
                  <SelectItem key={seller._id} value={seller._id}>
                    {seller.username || seller.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.seller_id && (
          <p className="text-red-400 text-sm mt-1">
            {errors.seller_id.message}
          </p>
        )}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="da_score" className="text-gray-300">
            DA Score (0-100)
          </Label>
          <Input
            id="da_score"
            type="number"
            {...register("da_score")}
            className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          {errors.da_score && (
            <p className="text-red-400 text-sm mt-1">
              {errors.da_score.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="pa_score" className="text-gray-300">
            PA Score (0-100)
          </Label>
          <Input
            id="pa_score"
            type="number"
            {...register("pa_score")}
            className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          {errors.pa_score && (
            <p className="text-red-400 text-sm mt-1">
              {errors.pa_score.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="traffic" className="text-gray-300">
            Monthly Traffic
          </Label>
          <Input
            id="traffic"
            type="number"
            {...register("traffic")}
            className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          {errors.traffic && (
            <p className="text-red-400 text-sm mt-1">
              {errors.traffic.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="category" className="text-white">
          Category
        </Label>

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent className="bg-[#0d0d0d] border-[#2a2a3a] text-white">
                {domainCategories.map((item) => (
                  <SelectItem
                    key={item.name}
                    value={item.name}
                    className="text-white hover:!bg-gray-700 font-mono"
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* <div>
        <Label htmlFor="category" className="text-gray-300">
          Category
        </Label>
        <Input
          id="category"
          {...register("category")}
          className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
        />
        {errors.category && (
          <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
        )}
      </div> */}

      <div>
        <Label htmlFor="tags" className="text-gray-300">
          Tags
        </Label>
        <div className="flex gap-2">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTagAdd();
              }
            }}
            placeholder="Add a tag and press Enter"
            className="flex-grow bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          <Button
            type="button"
            onClick={handleTagAdd}
            variant="outline"
            className="text-[#00ff9d] border-[#00ff9d] hover:bg-[#00ff9d]/10"
          >
            Add Tag
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {currentTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-[#2a2a3a] text-gray-300 border-[#3a3a4a]"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                &times;
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="admin_notes" className="text-gray-300">
          Admin Notes
        </Label>
        <Textarea
          id="admin_notes"
          {...register("admin_notes")}
          className="bg-[#0d0d0d] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
        />
        {errors.admin_notes && (
          <p className="text-red-400 text-sm mt-1">
            {errors.admin_notes.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="premium"
          {...register("premium")}
          className="rounded bg-[#2a2a3a] border-[#3a3a4a] text-[#00ff9d] focus:ring-[#00ff9d]"
          disabled={isSubmitting}
        />
        <Label htmlFor="premium" className="text-white">
          Premium domain
        </Label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={() => {
            onCancel()
            clearErrors()
          }}
          variant="outline"
          className="text-gray-300 border-gray-600 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#00ff9d] text-black hover:bg-[#00cc88]"
        >
          {loading
            ? "Saving..."
            : initialData
            ? "Save Changes"
            : "Create Domain"}
        </Button>
      </div>
    </form>
  );
}
