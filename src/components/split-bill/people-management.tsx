import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Person } from "@/types/split-bill";
import { useState } from "react";

interface PeopleManagementProps {
  people: Person[];
  onAddPerson: (name: string) => void;
}

export function PeopleManagement({ people, onAddPerson }: PeopleManagementProps) {
  const [newPersonName, setNewPersonName] = useState("");

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName("");
    }
  };

  return (
    <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <UserPlus className="h-5 w-5 text-blue-400" /> People
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Input
            data-testid="add-person-input"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter name"
            className="bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
          />
          <Button
            data-testid="add-person-button"
            onClick={handleAddPerson}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 transition-all duration-200"
            disabled={!newPersonName.trim()}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2" data-testid="people-list">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white hover:bg-slate-900/80 transition-colors"
            >
              <UserPlus className="h-4 w-4 text-blue-400" />
              <span>{person.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 