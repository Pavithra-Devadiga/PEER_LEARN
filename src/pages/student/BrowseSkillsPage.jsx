import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Palette, Globe, Music, Sparkles } from 'lucide-react';
import { TintedCard } from '../../components/primitives/TintedCard';
import { placeholderData } from '../../data/placeholderData';

export function BrowseSkillsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const categories = placeholderData.categories;

  const iconMap = {
    Code: Code,
    Palette: Palette,
    Globe: Globe,
    Music: Music,
  };

  const handleSelectSkill = (skillName) => {
    navigate(`/student/tutors?skill=${encodeURIComponent(skillName)}`);
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Browse Skills
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Discover skills taught by top peer tutors across all departments.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills, topics, tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-card border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-xs sm:text-sm font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Categories Stack */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Sparkles;
          const filteredSkills = cat.skills.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          );

          if (filteredSkills.length === 0) return null;

          return (
            <div key={cat.name} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/60">
                <Icon className="w-4 h-4 text-accent" />
                <h2 className="text-base font-bold text-text-main">{cat.name}</h2>
                <span className="text-xs text-text-muted font-semibold ml-auto">
                  {filteredSkills.length} skills
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredSkills.map((skill) => (
                  <TintedCard
                    key={skill.id}
                    title={skill.name}
                    subtitle={`Topics include: ${skill.tags.join(', ')}`}
                    tutorCount={skill.tutorCount}
                    tint={cat.tint}
                    actionLabel="View Tutors"
                    onClick={() => handleSelectSkill(skill.name)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
