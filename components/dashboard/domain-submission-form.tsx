"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { postData } from "@/services/API";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const categories = [
  { name: "Business", value: "business" },
  { name: "Technology", value: "technology" },
  { name: "Etc", value: "etc" },
];

export default function DomainSubmissionForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [formData, setFormData] = useState({
    domain: "",
    description: "",
    price: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    postData("/user/domains/submit-domain", {
      ...formData,
      price: Number(formData.price) || 0,
      category,
      tags,
    })
      .then((res) => {
        // Reset form
        setFormData({
          domain: "",
          description: "",
          price: "",
        });

        setCategory("");

        setTags([]);

        setSuccessModal(true);

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || "Submit domain failed");
        setLoading(false);
      });
  };

  const closeModalHandler = () => {
    setSuccessModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Dialog open={successModal} onOpenChange={closeModalHandler}>
        <DialogOverlay />
        <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-[#d1f7ff] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neon-green">
              Domain successfully submitted
            </DialogTitle>
          </DialogHeader>

          <p>redirecting to dashboard...</p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModalHandler}
              className="w-full"
            >
              ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            Submit Domain for Approval
          </CardTitle>
          <p className="text-gray-400">
            Submit your domain for admin review. Once approved, it will be
            available in the marketplace.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 mb-2">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="domain" className="text-white">
                Domain Name *
              </Label>
              <Input
                id="domain"
                name="domain"
                type="text"
                placeholder="example.com"
                value={formData.domain}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your domain, its history, and potential use cases..."
                value={formData.description}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-white">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="1000"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>

                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white font-mono">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="text-white hover:!bg-gray-700 font-mono"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="bg-[#00ff9d] text-black hover:bg-[#00e68a]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-700 text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.domain}
              className="w-full bg-[#00ff9d] text-black hover:bg-[#00e68a]"
            >
              {loading ? "Submitting..." : "Submit Domain"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
