"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlusCircle } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { apiReq } from "@/lib/api";
import { CATEGORIES } from "@/data/seed";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Alert,
  Button,
  Card,
  Field,
  PageHeading,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";

export default function AddCampaign() {
  const { dbUser } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [fundingGoal, setFundingGoal] = useState(1000);
  const [minContribution, setMinContribution] = useState(10);
  const [deadline, setDeadline] = useState("");
  const [rewardInfo, setRewardInfo] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 6) return setError("Give your campaign a clear title (6+ characters).");
    if (story.trim().length < 40) return setError("Tell backers your story in at least 40 characters.");
    if (fundingGoal < 100) return setError("Funding goal should be at least 100 credits.");
    if (minContribution < 1) return setError("Minimum contribution must be at least 1 credit.");
    if (minContribution > fundingGoal) return setError("Minimum contribution can't exceed the goal.");
    if (!deadline) return setError("Please choose a deadline.");
    if (new Date(deadline).getTime() <= Date.now()) return setError("Deadline must be in the future.");

    setLoading(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "campaign";
    const finalImage = image || `https://picsum.photos/seed/${slug}-${Date.now()}/1200/750`;

    const { data, error: err } = await apiReq("/campaigns", {
      method: "POST",
      body: {
        title: title.trim(),
        story: story.trim(),
        category,
        fundingGoal,
        minContribution,
        deadline: new Date(deadline).toISOString(),
        rewardInfo: rewardInfo.trim(),
        image: finalImage,
        creatorEmail: dbUser?.email,
        creatorName: dbUser?.name,
      },
    });
    setLoading(false);
    if (err || !data) {
      setError(err || "Could not create the campaign.");
      return;
    }
    router.push("/dashboard/creator/my-campaigns?created=1");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeading
        title="Start a new campaign"
        subtitle="Fill in the details below. Your campaign goes live once an admin approves it."
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImageUpload
            label="Cover image"
            shape="wide"
            onChange={setImage}
            onUploadingChange={setUploading}
          />

          <Field label="Campaign title" htmlFor="title">
            <TextInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solar lanterns for rural classrooms"
              required
            />
          </Field>

          <Field label="Story" htmlFor="story" hint="Explain what you're building and why it matters.">
            <TextArea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Share the problem, your plan, and how the funds will be used…"
              className="min-h-36"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Deadline" htmlFor="deadline">
              <TextInput
                id="deadline"
                type="date"
                min={today}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </Field>
            <Field label="Funding goal (credits)" htmlFor="goal">
              <TextInput
                id="goal"
                type="number"
                min={100}
                value={fundingGoal}
                onChange={(e) => setFundingGoal(Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Minimum contribution (credits)" htmlFor="min">
              <TextInput
                id="min"
                type="number"
                min={1}
                value={minContribution}
                onChange={(e) => setMinContribution(Number(e.target.value))}
                required
              />
            </Field>
          </div>

          <Field label="Reward info" htmlFor="reward" hint="What do backers get at different tiers?">
            <TextArea
              id="reward"
              value={rewardInfo}
              onChange={(e) => setRewardInfo(e.target.value)}
              placeholder="e.g. 50+ credits: a thank-you postcard. 200+ credits: a product unit."
            />
          </Field>

          {error && <Alert tone="error">{error}</Alert>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={uploading}>
              <FiPlusCircle /> {uploading ? "Uploading image…" : "Submit for review"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
