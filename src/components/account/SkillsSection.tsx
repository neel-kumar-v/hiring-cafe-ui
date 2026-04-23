"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/app";
import { Edit, Plus, X } from "lucide-react";
import { useState } from "react";

interface SkillsSectionProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export default function SkillsSection({ user, onUserUpdate }: SkillsSectionProps) {
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      onUserUpdate({
        ...user,
        skills: [...user.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onUserUpdate({
      ...user,
      skills: user.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addSkill();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Skills
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingSkills(!isEditingSkills)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Edit className="h-4 w-4" />
          {isEditingSkills ? "Done" : "Edit"}
        </Button>
      </div>
      {isEditingSkills ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded-md bg-brand-soft px-3 py-1 text-base text-brand-soft-foreground"
                style={{ whiteSpace: "nowrap" }}
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 cursor-pointer transition-colors hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a new skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={addSkill}
              disabled={!newSkill.trim()}
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {user.skills.length > 0 ? (
            user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-brand-soft px-3 py-1 text-base text-brand-soft-foreground"
                style={{ whiteSpace: "nowrap" }}
                title={skill}
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-muted-foreground italic">
              No skills added yet. Click edit to add your skills.
            </p>
          )}
        </div>
      )}
    </div>
  );
} 
