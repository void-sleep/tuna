'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PlusIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  ArrowLeftIcon,
  LinkIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type {
  FamilyMember,
  FamilyRelation,
  RelationType,
  GenderType,
  AvatarType,
} from '@/lib/supabase/family-tree';
import { KINSHIP_TERMS } from '@/lib/data/kinship-terms';

interface FamilyTreeRunnerProps {
  applicationId: string;
}

// Avatar icons based on type
const AVATAR_ICONS: Record<string, string> = {
  elder_male: '👴',
  elder_female: '👵',
  adult_male: '👨',
  adult_female: '👩',
  youth_male: '👦',
  youth_female: '👧',
  child: '👶',
};

// Relation config with gender and avatar defaults
const RELATION_CONFIG: Record<RelationType, {
  icon: string;
  gender: GenderType;
  avatar: AvatarType;
  label: string;
}> = {
  father: { icon: '👨', gender: 'male', avatar: 'elder_male', label: '父亲' },
  mother: { icon: '👩', gender: 'female', avatar: 'elder_female', label: '母亲' },
  son: { icon: '👦', gender: 'male', avatar: 'youth_male', label: '儿子' },
  daughter: { icon: '👧', gender: 'female', avatar: 'youth_female', label: '女儿' },
  spouse: { icon: '💑', gender: 'male', avatar: 'adult_male', label: '配偶' },
  elder_brother: { icon: '👨', gender: 'male', avatar: 'adult_male', label: '哥哥' },
  younger_brother: { icon: '👦', gender: 'male', avatar: 'youth_male', label: '弟弟' },
  elder_sister: { icon: '👩', gender: 'female', avatar: 'adult_female', label: '姐姐' },
  younger_sister: { icon: '👧', gender: 'female', avatar: 'youth_female', label: '妹妹' },
};

interface PathStep {
  relation: RelationType;
  gender: GenderType;
}

// Node position for tree layout
interface NodePosition {
  id: string;
  x: number;
  y: number;
  member: FamilyMember;
}

export function FamilyTreeRunner({ applicationId }: FamilyTreeRunnerProps) {
  const t = useTranslations('familyTree.run');
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relations, setRelations] = useState<FamilyRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showPathPicker, setShowPathPicker] = useState(false);

  // Add form state
  const [addFromMember, setAddFromMember] = useState<FamilyMember | null>(null);
  const [addRelationType, setAddRelationType] = useState<RelationType | null>(null);
  const [newMemberName, setNewMemberName] = useState('');

  // Edit form state
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editRealName, setEditRealName] = useState('');
  const [editGender, setEditGender] = useState<GenderType>('male');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAvatar, setEditAvatar] = useState<AvatarType>('adult_male');
  const [editNotes, setEditNotes] = useState('');

  // Connect members state
  const [connectFrom, setConnectFrom] = useState<FamilyMember | null>(null);
  const [connectTo, setConnectTo] = useState<FamilyMember | null>(null);

  // Path picker state
  const [pathSteps, setPathSteps] = useState<PathStep[]>([]);
  const [pathResult, setPathResult] = useState<{ term: string; reverse: string } | null>(null);

  // Two-person selection for relationship lookup
  const [secondSelectedMember, setSecondSelectedMember] = useState<FamilyMember | null>(null);
  const [showRelationshipResult, setShowRelationshipResult] = useState(false);

  const selfMember = members.find(m => m.is_self);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddDialog || showEditDialog || showConnectDialog || showPathPicker || showRelationshipResult) {
          // Close dialogs first
          setShowAddDialog(false);
          setShowEditDialog(false);
          setShowConnectDialog(false);
          setShowPathPicker(false);
          setShowRelationshipResult(false);
        } else if (secondSelectedMember) {
          setSecondSelectedMember(null);
        } else if (selectedMember) {
          setSelectedMember(null);
        } else {
          router.push('/apps');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, showAddDialog, showEditDialog, showConnectDialog, showPathPicker, showRelationshipResult, selectedMember, secondSelectedMember]);

  useEffect(() => {
    loadFamilyData();
  }, [applicationId]);

  const loadFamilyData = async () => {
    try {
      const response = await fetch(`/api/family/tree?applicationId=${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
        setRelations(data.relations || []);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate node positions for tree layout
  const calculateNodePositions = useCallback((): NodePosition[] => {
    if (members.length === 0) return [];

    const positions: NodePosition[] = [];
    const centerX = 50;
    const centerY = 40;
    const levelHeight = 18;
    const nodeSpacing = 18;

    const self = members.find(m => m.is_self);
    if (!self) {
      members.forEach((member, index) => {
        const angle = (index / members.length) * 2 * Math.PI - Math.PI / 2;
        positions.push({
          id: member.id,
          x: centerX + Math.cos(angle) * 25,
          y: centerY + Math.sin(angle) * 20,
          member,
        });
      });
      return positions;
    }

    positions.push({ id: self.id, x: centerX, y: centerY, member: self });

    const parents: FamilyMember[] = [];
    const children: FamilyMember[] = [];
    const spouses: FamilyMember[] = [];
    const others: FamilyMember[] = [];

    members.filter(m => !m.is_self).forEach(member => {
      const relationFromSelf = relations.find(r =>
        r.from_member_id === self.id && r.to_member_id === member.id
      );
      const relationToSelf = relations.find(r =>
        r.to_member_id === self.id && r.from_member_id === member.id
      );

      if (relationFromSelf) {
        if (relationFromSelf.relation_type === 'father' || relationFromSelf.relation_type === 'mother') {
          parents.push(member);
        } else if (relationFromSelf.relation_type === 'son' || relationFromSelf.relation_type === 'daughter') {
          children.push(member);
        } else if (relationFromSelf.relation_type === 'spouse') {
          spouses.push(member);
        } else {
          others.push(member);
        }
      } else if (relationToSelf) {
        if (relationToSelf.relation_type === 'son' || relationToSelf.relation_type === 'daughter') {
          parents.push(member);
        } else if (relationToSelf.relation_type === 'father' || relationToSelf.relation_type === 'mother') {
          children.push(member);
        } else if (relationToSelf.relation_type === 'spouse') {
          spouses.push(member);
        } else {
          others.push(member);
        }
      } else {
        others.push(member);
      }
    });

    parents.forEach((member, index) => {
      const offsetX = (index - (parents.length - 1) / 2) * nodeSpacing;
      positions.push({
        id: member.id,
        x: centerX + offsetX,
        y: centerY - levelHeight,
        member,
      });
    });

    spouses.forEach((member, index) => {
      positions.push({
        id: member.id,
        x: centerX + nodeSpacing * (index + 1),
        y: centerY,
        member,
      });
    });

    children.forEach((member, index) => {
      const offsetX = (index - (children.length - 1) / 2) * nodeSpacing;
      positions.push({
        id: member.id,
        x: centerX + offsetX,
        y: centerY + levelHeight,
        member,
      });
    });

    others.forEach((member, index) => {
      const angle = (index / Math.max(others.length, 1)) * Math.PI - Math.PI / 2;
      positions.push({
        id: member.id,
        x: 15 + Math.cos(angle) * 10,
        y: centerY + Math.sin(angle) * 20,
        member,
      });
    });

    return positions;
  }, [members, relations]);

  const nodePositions = calculateNodePositions();

  // Build relation path string from steps
  const buildPathString = useCallback((steps: PathStep[]): string => {
    return steps.map(s => s.relation).join('.');
  }, []);

  // Find kinship term by path
  const findTermByPath = useCallback((path: string, gender: GenderType): { term: string; reverse: string } | null => {
    const term = KINSHIP_TERMS.find(t =>
      t.relation_path === path &&
      t.gender === gender &&
      t.region === 'default'
    );
    if (term) {
      return { term: term.term_standard, reverse: term.term_reverse };
    }
    return null;
  }, []);

  // Calculate relation path from self to target member
  const calculateRelationPath = useCallback((targetId: string): string[] => {
    if (!selfMember) return [];

    const visited = new Set<string>();
    const queue: { memberId: string; path: string[] }[] = [
      { memberId: selfMember.id, path: [] }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.memberId === targetId) {
        return current.path;
      }

      if (visited.has(current.memberId)) continue;
      visited.add(current.memberId);

      const memberRelations = relations.filter(r => r.from_member_id === current.memberId);
      for (const rel of memberRelations) {
        if (!visited.has(rel.to_member_id)) {
          queue.push({
            memberId: rel.to_member_id,
            path: [...current.path, rel.relation_type]
          });
        }
      }

      const reverseRelations = relations.filter(r => r.to_member_id === current.memberId);
      for (const rel of reverseRelations) {
        if (!visited.has(rel.from_member_id)) {
          const invertedType = invertRelation(rel.relation_type);
          if (invertedType) {
            queue.push({
              memberId: rel.from_member_id,
              path: [...current.path, invertedType]
            });
          }
        }
      }
    }

    return [];
  }, [selfMember, relations]);

  const invertRelation = (type: RelationType): RelationType | null => {
    const inversions: Record<RelationType, RelationType> = {
      father: 'son',
      mother: 'daughter',
      son: 'father',
      daughter: 'mother',
      spouse: 'spouse',
      elder_brother: 'younger_brother',
      younger_brother: 'elder_brother',
      elder_sister: 'younger_sister',
      younger_sister: 'elder_sister',
    };
    return inversions[type] || null;
  };

  const getMemberRelation = (member: FamilyMember): { term: string; reverse: string; path: string[] } | null => {
    if (!selfMember || member.is_self) return null;

    const path = calculateRelationPath(member.id);
    if (path.length === 0) return null;

    const pathString = path.join('.');
    const result = findTermByPath(pathString, member.gender);
    return result ? { ...result, path } : null;
  };

  // Calculate relationship between any two members
  const calculateRelationBetween = useCallback((fromId: string, toId: string): { path: string[]; term: string | null; reverse: string | null } | null => {
    const toMember = members.find(m => m.id === toId);
    if (!toMember) return null;

    const visited = new Set<string>();
    const queue: { memberId: string; path: string[] }[] = [
      { memberId: fromId, path: [] }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.memberId === toId) {
        const pathString = current.path.join('.');
        const result = findTermByPath(pathString, toMember.gender);
        return {
          path: current.path,
          term: result?.term || null,
          reverse: result?.reverse || null,
        };
      }

      if (visited.has(current.memberId)) continue;
      visited.add(current.memberId);

      const memberRelations = relations.filter(r => r.from_member_id === current.memberId);
      for (const rel of memberRelations) {
        if (!visited.has(rel.to_member_id)) {
          queue.push({
            memberId: rel.to_member_id,
            path: [...current.path, rel.relation_type]
          });
        }
      }

      const reverseRelations = relations.filter(r => r.to_member_id === current.memberId);
      for (const rel of reverseRelations) {
        if (!visited.has(rel.from_member_id)) {
          const invertedType = invertRelation(rel.relation_type);
          if (invertedType) {
            queue.push({
              memberId: rel.from_member_id,
              path: [...current.path, invertedType]
            });
          }
        }
      }
    }

    return { path: [], term: null, reverse: null };
  }, [members, relations, findTermByPath]);

  // Get direct relation between two members
  const getDirectRelation = useCallback((fromId: string, toId: string): FamilyRelation | null => {
    return relations.find(r =>
      (r.from_member_id === fromId && r.to_member_id === toId) ||
      (r.from_member_id === toId && r.to_member_id === fromId)
    ) || null;
  }, [relations]);

  // Get all relations for a member
  const getMemberRelations = useCallback((memberId: string): { relation: FamilyRelation; otherMember: FamilyMember; direction: 'from' | 'to' }[] => {
    const result: { relation: FamilyRelation; otherMember: FamilyMember; direction: 'from' | 'to' }[] = [];

    for (const rel of relations) {
      if (rel.from_member_id === memberId) {
        const otherMember = members.find(m => m.id === rel.to_member_id);
        if (otherMember) {
          result.push({ relation: rel, otherMember, direction: 'from' });
        }
      } else if (rel.to_member_id === memberId) {
        const otherMember = members.find(m => m.id === rel.from_member_id);
        if (otherMember) {
          result.push({ relation: rel, otherMember, direction: 'to' });
        }
      }
    }

    return result;
  }, [relations, members]);

  // Handle node click - support two-member selection
  const handleNodeClick = (member: FamilyMember, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already in relationship view mode and clicking a new member
    if (showRelationshipResult && selectedMember && member.id !== selectedMember.id) {
      setSecondSelectedMember(member);
      return;
    }

    // If a member is already selected and clicking a different member, show relationship
    if (selectedMember && selectedMember.id !== member.id) {
      setSecondSelectedMember(member);
      setShowRelationshipResult(true);
      return;
    }

    // If clicking the same member, deselect
    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      setSecondSelectedMember(null);
      setShowRelationshipResult(false);
    } else {
      // Clicking first member
      setSelectedMember(member);
      setSecondSelectedMember(null);
      setShowRelationshipResult(false);
    }
  };

  // Delete a relation
  const handleDeleteRelation = async (relationId: string) => {
    if (!confirm('确定要删除这个关系吗？')) return;

    try {
      const response = await fetch(`/api/family/relations/${relationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete relation');

      await loadFamilyData();
    } catch (error) {
      console.error('Error deleting relation:', error);
    }
  };

  // Open Add Dialog for adding new member relative to selected
  const openAddMemberDialog = (fromMember: FamilyMember | null, relationType?: RelationType) => {
    setAddFromMember(fromMember);
    setAddRelationType(relationType || null);
    setNewMemberName('');
    setShowAddDialog(true);
  };

  // Open Edit Dialog
  const openEditDialog = (member: FamilyMember) => {
    setEditingMember(member);
    setEditName(member.nickname);
    setEditRealName(member.real_name || '');
    setEditGender(member.gender);
    setEditBirthDate(member.birth_date || '');
    setEditAvatar(member.avatar_type);
    setEditNotes(member.notes || '');
    setShowEditDialog(true);
  };

  // Open Connect Dialog
  const openConnectDialog = () => {
    if (selectedMember) {
      setConnectFrom(selectedMember);
      setConnectTo(null);
      setShowConnectDialog(true);
    }
  };

  // Create new member
  const handleCreateMember = async () => {
    if (!newMemberName.trim()) return;

    setIsSaving(true);
    try {
      let gender: GenderType = 'male';
      let avatar: AvatarType = 'adult_male';

      if (addRelationType) {
        const config = RELATION_CONFIG[addRelationType];
        gender = config.gender;

        if (addRelationType === 'spouse' && addFromMember) {
          gender = addFromMember.gender === 'male' ? 'female' : 'male';
        }

        avatar = gender === 'male'
          ? (addRelationType === 'father' ? 'elder_male' : addRelationType === 'son' ? 'youth_male' : 'adult_male')
          : (addRelationType === 'mother' ? 'elder_female' : addRelationType === 'daughter' ? 'youth_female' : 'adult_female');
      }

      // Create member
      const memberResponse = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: newMemberName.trim(),
          gender,
          avatar_type: avatar,
          is_self: false,
          applicationId,
        }),
      });

      if (!memberResponse.ok) throw new Error('Failed to create member');
      const newMember = await memberResponse.json();

      // Create relation if from member is specified
      if (addFromMember && addRelationType) {
        const relationResponse = await fetch('/api/family/relations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_member_id: addFromMember.id,
            to_member_id: newMember.id,
            relation_type: addRelationType,
            applicationId,
          }),
        });

        if (!relationResponse.ok) throw new Error('Failed to create relation');
      }

      await loadFamilyData();
      setShowAddDialog(false);
      setAddFromMember(null);
      setAddRelationType(null);
      setNewMemberName('');
      setSelectedMember(null);
    } catch (error) {
      console.error('Error creating member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Create self member (fallback if auto-creation failed)
  const handleCreateSelf = async () => {
    if (!newMemberName.trim()) return;

    setIsSaving(true);
    try {
      const selfResponse = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: newMemberName.trim(),
          gender: 'male',
          avatar_type: 'adult_male',
          is_self: true,
          applicationId,
        }),
      });

      if (!selfResponse.ok) throw new Error('Failed to create self');

      await loadFamilyData();
      setShowAddDialog(false);
      setNewMemberName('');
    } catch (error) {
      console.error('Error creating self:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete member
  const handleDeleteMember = async (member: FamilyMember) => {
    if (!confirm(`确定要删除 "${member.nickname}" 吗？相关的关系也会一并删除。`)) return;

    try {
      const response = await fetch(`/api/family/members/${member.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete member');

      await loadFamilyData();
      setSelectedMember(null);
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  // Save edited member
  const handleSaveEdit = async () => {
    if (!editingMember || !editName.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/family/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: editName.trim(),
          real_name: editRealName.trim() || null,
          gender: editGender,
          birth_date: editBirthDate || null,
          avatar_type: editAvatar,
          notes: editNotes.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update member');

      await loadFamilyData();
      setShowEditDialog(false);
      setEditingMember(null);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Connect two existing members
  const handleConnectMembers = async (relationType: RelationType) => {
    if (!connectFrom || !connectTo) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/family/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_member_id: connectFrom.id,
          to_member_id: connectTo.id,
          relation_type: relationType,
          applicationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create relation');

      await loadFamilyData();
      setShowConnectDialog(false);
      setConnectFrom(null);
      setConnectTo(null);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error connecting members:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Path picker functions
  const addPathStep = (relation: RelationType, gender: GenderType) => {
    const newSteps = [...pathSteps, { relation, gender }];
    setPathSteps(newSteps);
    const pathString = buildPathString(newSteps);
    const result = findTermByPath(pathString, gender);
    setPathResult(result);
  };

  const removeLastStep = () => {
    if (pathSteps.length > 0) {
      const newSteps = pathSteps.slice(0, -1);
      setPathSteps(newSteps);
      if (newSteps.length > 0) {
        const lastStep = newSteps[newSteps.length - 1];
        const pathString = buildPathString(newSteps);
        const result = findTermByPath(pathString, lastStep.gender);
        setPathResult(result);
      } else {
        setPathResult(null);
      }
    }
  };

  const resetPathPicker = () => {
    setPathSteps([]);
    setPathResult(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 flex items-center justify-center">
              <span className="text-4xl animate-pulse">🌳</span>
            </div>
          </div>
          <p className="text-lg text-amber-300/80">Loading...</p>
        </div>
      </div>
    );
  }

  // No self member - prompt to create
  if (!selfMember) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('noData.title')}</h2>
            <p className="text-amber-300/60">{t('noData.description')}</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="输入你的称呼（如：我、本人）"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="bg-white/5 border-amber-500/30 text-white placeholder:text-amber-300/40"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSelf()}
            />
            <Button
              onClick={handleCreateSelf}
              disabled={!newMemberName.trim() || isSaving}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-500 text-white"
            >
              <PlusIcon className="h-5 w-5" />
              {isSaving ? '创建中...' : '开始创建家谱'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 overflow-hidden"
      onClick={() => setSelectedMember(null)}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
        {/* Back button */}
        <Button
          onClick={() => router.push('/apps')}
          variant="ghost"
          className="gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-400/30"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm">返回</span>
        </Button>

        {/* Title */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          🌳 {t('title')}
        </h1>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Add Member button */}
          <Button
            onClick={() => openAddMemberDialog(selfMember)}
            className="gap-2 rounded-xl bg-green-600/80 hover:bg-green-500 text-white border border-green-400/40"
          >
            <UserPlusIcon className="h-5 w-5" />
            添加成员
          </Button>

          {/* Quick Search Button */}
          <Button
            onClick={() => setShowPathPicker(true)}
            className="gap-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white border border-amber-400/40"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            {t('quickSearch')}
          </Button>
        </div>
      </div>

      {/* SVG Lines for connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {relations.map(rel => {
          const fromPos = nodePositions.find(n => n.id === rel.from_member_id);
          const toPos = nodePositions.find(n => n.id === rel.to_member_id);
          if (!fromPos || !toPos) return null;

          return (
            <line
              key={rel.id}
              x1={`${fromPos.x}%`}
              y1={`${fromPos.y}%`}
              x2={`${toPos.x}%`}
              y2={`${toPos.y}%`}
              stroke="rgba(251, 191, 36, 0.3)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodePositions.map(node => {
        const isSelected = selectedMember?.id === node.id;
        const isSecondSelected = secondSelectedMember?.id === node.id;
        const relation = getMemberRelation(node.member);

        return (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div
              onClick={(e) => handleNodeClick(node.member, e)}
              className={`
                relative cursor-pointer transition-all duration-200
                ${isSelected || isSecondSelected ? 'scale-110' : 'hover:scale-105'}
              `}
            >
              {/* Avatar */}
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg
                ${node.member.is_self
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-400'
                  : 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40'}
                ${isSelected ? 'ring-4 ring-amber-400/50' : ''}
                ${isSecondSelected ? 'ring-4 ring-blue-400/50' : ''}
              `}>
                {node.member.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={node.member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  AVATAR_ICONS[node.member.avatar_type] || '👤'
                )}
              </div>

              {/* Name label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-sm font-medium text-white">{node.member.nickname}</span>
                {relation && !node.member.is_self && (
                  <span className="block text-xs text-amber-300/60">{relation.term.split('/')[0]}</span>
                )}
                {node.member.is_self && (
                  <span className="block text-xs text-amber-400">我</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom Panel - shows when member selected */}
      {selectedMember && !showRelationshipResult && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-amber-500/30 backdrop-blur-sm z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-3xl mx-auto p-4">
            {/* Hint for relationship lookup */}
            <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">
                💡 点击另一位成员，查看 <span className="font-medium">{selectedMember.nickname}</span> 与 ta 的称呼关系
              </span>
            </div>

            {/* Member Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg
                ${selectedMember.is_self
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-400'
                  : 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40'}
              `}>
                {AVATAR_ICONS[selectedMember.avatar_type] || '👤'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{selectedMember.nickname}</h3>
                {selectedMember.is_self ? (
                  <p className="text-sm text-amber-400">我</p>
                ) : (
                  <p className="text-sm text-amber-300/60">
                    {getMemberRelation(selectedMember)?.term.split('/')[0] || '家庭成员'}
                  </p>
                )}
              </div>
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(selectedMember)}
                  className="gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                >
                  <PencilIcon className="h-4 w-4" />
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openConnectDialog}
                  className="gap-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <LinkIcon className="h-4 w-4" />
                  建立关系
                </Button>
                {!selectedMember.is_self && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteMember(selectedMember)}
                    className="gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    删除
                  </Button>
                )}
              </div>
            </div>

            {/* Existing Relations */}
            {(() => {
              const memberRelations = getMemberRelations(selectedMember.id);
              if (memberRelations.length > 0) {
                return (
                  <div className="mb-4">
                    <p className="text-xs text-amber-300/50 mb-2">已有关系：</p>
                    <div className="flex flex-wrap gap-2">
                      {memberRelations.map(({ relation, otherMember, direction }) => (
                        <div
                          key={relation.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-amber-500/20"
                        >
                          <span className="text-lg">{AVATAR_ICONS[otherMember.avatar_type] || '👤'}</span>
                          <span className="text-sm text-amber-300">
                            {direction === 'from'
                              ? `${otherMember.nickname}（${RELATION_CONFIG[relation.relation_type].label}）`
                              : `${otherMember.nickname}（是我的${RELATION_CONFIG[invertRelation(relation.relation_type) || relation.relation_type]?.label || relation.relation_type}）`
                            }
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRelation(relation.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Add Relation Buttons */}
            <div>
              <p className="text-xs text-amber-300/50 mb-2">快速添加 {selectedMember.nickname} 的亲属：</p>
              <div className="flex flex-wrap gap-2">
                {(['father', 'mother', 'spouse', 'elder_brother', 'younger_brother', 'elder_sister', 'younger_sister', 'son', 'daughter'] as RelationType[]).map(rel => (
                  <Button
                    key={rel}
                    size="sm"
                    variant="outline"
                    onClick={() => openAddMemberDialog(selectedMember, rel)}
                    className="gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  >
                    <span>{RELATION_CONFIG[rel].icon}</span>
                    +{RELATION_CONFIG[rel].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-person Relationship Result Panel */}
      {showRelationshipResult && selectedMember && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-green-500/30 backdrop-blur-sm z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-2xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">查看关系</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowRelationshipResult(false);
                  setSecondSelectedMember(null);
                }}
                className="text-green-300/60 hover:text-white"
              >
                关闭
              </Button>
            </div>

            {!secondSelectedMember ? (
              // Select second member
              <div>
                <p className="text-sm text-green-300/60 mb-3">
                  点击另一位成员，查看 <span className="text-green-300">{selectedMember.nickname}</span> 与 ta 的关系
                </p>
                <div className="flex flex-wrap gap-2">
                  {members
                    .filter(m => m.id !== selectedMember.id)
                    .map(member => (
                      <Button
                        key={member.id}
                        variant="outline"
                        onClick={() => setSecondSelectedMember(member)}
                        className="flex items-center gap-2 border-green-500/30 text-green-300 hover:bg-green-500/20"
                      >
                        <span className="text-xl">{AVATAR_ICONS[member.avatar_type] || '👤'}</span>
                        <span>{member.nickname}</span>
                      </Button>
                    ))}
                </div>
              </div>
            ) : (
              // Show relationship result
              <div>
                {(() => {
                  const relationship = calculateRelationBetween(selectedMember.id, secondSelectedMember.id);
                  const directRelation = getDirectRelation(selectedMember.id, secondSelectedMember.id);

                  return (
                    <div className="space-y-4">
                      {/* Two members display */}
                      <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-white/5">
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full bg-amber-500/30 flex items-center justify-center text-3xl mb-2 ring-2 ring-amber-400/50">
                            {AVATAR_ICONS[selectedMember.avatar_type] || '👤'}
                          </div>
                          <span className="text-sm text-amber-300">{selectedMember.nickname}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-green-400 text-2xl mb-1">↔</div>
                          {directRelation && (
                            <span className="text-xs text-green-300/60 bg-green-500/20 px-2 py-0.5 rounded">
                              直接关系
                            </span>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full bg-blue-500/30 flex items-center justify-center text-3xl mb-2 ring-2 ring-blue-400/50">
                            {AVATAR_ICONS[secondSelectedMember.avatar_type] || '👤'}
                          </div>
                          <span className="text-sm text-blue-300">{secondSelectedMember.nickname}</span>
                        </div>
                      </div>

                      {/* Relationship result */}
                      {relationship && relationship.path.length > 0 ? (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-green-300/60 mb-1">{selectedMember.nickname} 叫 {secondSelectedMember.nickname}</p>
                              <p className="text-xl font-bold text-green-300">
                                {relationship.term || '（未找到称呼）'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-300/60 mb-1">{secondSelectedMember.nickname} 叫 {selectedMember.nickname}</p>
                              <p className="text-xl font-bold text-blue-300">
                                {relationship.reverse || '（未找到称呼）'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-white/40">
                            关系路径：{relationship.path.map(p => RELATION_CONFIG[p as RelationType]?.label || p).join(' → ')}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                          <p className="text-amber-300/60">未找到两人之间的关系</p>
                          <p className="text-xs text-amber-300/40 mt-1">可能需要先建立关系链</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSecondSelectedMember(null)}
                          className="border-green-500/30 text-green-300"
                        >
                          选择其他成员
                        </Button>
                        {!directRelation && (
                          <Button
                            onClick={() => {
                              setConnectFrom(selectedMember);
                              setConnectTo(secondSelectedMember);
                              setShowRelationshipResult(false);
                              setShowConnectDialog(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            建立直接关系
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hint - only show when no member selected */}
      {!selectedMember && !showRelationshipResult && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-amber-300/40 text-sm text-center">
          <p>点击一位成员，再点击另一位，查看他们之间的关系称呼</p>
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-900/95 border border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle>
              {addRelationType
                ? `添加${addFromMember?.nickname || ''}的${RELATION_CONFIG[addRelationType].label}`
                : '添加家庭成员'}
            </DialogTitle>
            <DialogDescription className="text-amber-300/60">
              {addFromMember
                ? `相对于 ${addFromMember.nickname}`
                : '添加一位新的家庭成员'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Relation type selection if not specified */}
            {addFromMember && !addRelationType && (
              <div className="space-y-2">
                <p className="text-sm text-amber-300/60">选择关系类型：</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['father', 'mother', 'spouse', 'elder_brother', 'younger_brother', 'elder_sister', 'younger_sister', 'son', 'daughter'] as RelationType[]).map(rel => (
                    <Button
                      key={rel}
                      variant="outline"
                      onClick={() => setAddRelationType(rel)}
                      className="justify-start gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      <span>{RELATION_CONFIG[rel].icon}</span>
                      {RELATION_CONFIG[rel].label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Name input */}
            {(addRelationType || !addFromMember) && (
              <div className="space-y-2">
                <label className="text-sm text-amber-300/60">称呼</label>
                <Input
                  placeholder="输入称呼（如：爸爸、妈妈）"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-white/5 border-amber-500/30 text-white placeholder:text-amber-300/40"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateMember()}
                />
              </div>
            )}
          </div>

          {(addRelationType || !addFromMember) && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setAddFromMember(null);
                  setAddRelationType(null);
                }}
                className="border-amber-500/30 text-amber-300"
              >
                取消
              </Button>
              <Button
                onClick={handleCreateMember}
                disabled={!newMemberName.trim() || isSaving}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                {isSaving ? '创建中...' : '添加'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-900/95 border border-amber-500/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{AVATAR_ICONS[editingMember?.avatar_type || 'adult_male']}</span>
              编辑成员
            </DialogTitle>
            <DialogDescription className="text-amber-300/60">
              修改 {editingMember?.nickname} 的详细信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nickname (required) */}
            <div className="space-y-2">
              <label className="text-sm text-amber-300/60">
                称呼 <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="如：爸爸、大伯"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white/5 border-amber-500/30 text-white placeholder:text-amber-300/40"
                autoFocus
              />
            </div>

            {/* Real Name (optional) */}
            <div className="space-y-2">
              <label className="text-sm text-amber-300/60">真实姓名</label>
              <Input
                placeholder="可选"
                value={editRealName}
                onChange={(e) => setEditRealName(e.target.value)}
                className="bg-white/5 border-amber-500/30 text-white placeholder:text-amber-300/40"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm text-amber-300/60">性别</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editGender === 'male' ? 'default' : 'outline'}
                  onClick={() => setEditGender('male')}
                  className={editGender === 'male'
                    ? 'flex-1 bg-blue-600 hover:bg-blue-500 text-white'
                    : 'flex-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  }
                >
                  👨 男
                </Button>
                <Button
                  type="button"
                  variant={editGender === 'female' ? 'default' : 'outline'}
                  onClick={() => setEditGender('female')}
                  className={editGender === 'female'
                    ? 'flex-1 bg-pink-600 hover:bg-pink-500 text-white'
                    : 'flex-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  }
                >
                  👩 女
                </Button>
              </div>
            </div>

            {/* Birth Date (optional) */}
            <div className="space-y-2">
              <label className="text-sm text-amber-300/60">出生日期</label>
              <Input
                type="date"
                value={editBirthDate}
                onChange={(e) => setEditBirthDate(e.target.value)}
                className="bg-white/5 border-amber-500/30 text-white [color-scheme:dark]"
              />
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <label className="text-sm text-amber-300/60">头像</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(AVATAR_ICONS).map(([key, icon]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={editAvatar === key ? 'default' : 'outline'}
                    onClick={() => setEditAvatar(key as AvatarType)}
                    className={`text-2xl h-12 ${editAvatar === key
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes (optional) */}
            <div className="space-y-2">
              <label className="text-sm text-amber-300/60">备注</label>
              <textarea
                placeholder="可选备注信息"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-amber-500/30 text-white placeholder:text-amber-300/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-amber-500/30 text-amber-300"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editName.trim() || isSaving}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect Members Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-slate-900/95 border border-blue-500/30 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>建立亲属关系</DialogTitle>
            <DialogDescription className="text-blue-300/60">
              {connectTo
                ? `设置 ${connectTo.nickname} 和 ${connectFrom?.nickname} 的关系`
                : `选择要与 ${connectFrom?.nickname} 建立关系的人`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Select target member */}
            {!connectTo && (
              <div className="space-y-2">
                <p className="text-sm text-blue-300/60">请选择一位家庭成员：</p>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {members
                    .filter(m => m.id !== connectFrom?.id)
                    .map(member => (
                      <Button
                        key={member.id}
                        variant="outline"
                        onClick={() => setConnectTo(member)}
                        className="flex flex-col items-center gap-1 h-auto py-3 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                      >
                        <span className="text-2xl">{AVATAR_ICONS[member.avatar_type] || '👤'}</span>
                        <span className="text-xs">{member.nickname}</span>
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Select relation type */}
            {connectTo && (
              <div className="space-y-4">
                {/* Header showing the two people */}
                <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-white/5">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/30 border-2 border-amber-500/50 flex items-center justify-center text-2xl mb-2">
                      {AVATAR_ICONS[connectTo.avatar_type] || '👤'}
                    </div>
                    <span className="text-sm font-medium text-amber-300">{connectTo.nickname}</span>
                    <p className="text-xs text-amber-300/50">人物 A</p>
                  </div>
                  <div className="text-3xl text-blue-400/50">⟷</div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center text-2xl mb-2">
                      {AVATAR_ICONS[connectFrom?.avatar_type || 'adult_male'] || '👤'}
                    </div>
                    <span className="text-sm font-medium text-blue-300">{connectFrom?.nickname}</span>
                    <p className="text-xs text-blue-300/50">人物 B</p>
                  </div>
                </div>

                {/* Clear instruction */}
                <p className="text-center text-sm text-white/80 font-medium">
                  请选择：<span className="text-amber-300">{connectTo.nickname}</span> 是 <span className="text-blue-300">{connectFrom?.nickname}</span> 的什么？
                </p>

                {/* Relation options as complete sentences */}
                <div className="space-y-2">
                  {(['father', 'mother', 'spouse', 'elder_brother', 'younger_brother', 'elder_sister', 'younger_sister', 'son', 'daughter'] as RelationType[]).map(rel => (
                    <Button
                      key={rel}
                      variant="outline"
                      onClick={() => handleConnectMembers(rel)}
                      disabled={isSaving}
                      className="w-full justify-center gap-2 border-blue-500/30 text-white hover:bg-blue-500/20 hover:text-white h-auto py-3"
                    >
                      <span className="text-amber-300">{connectTo.nickname}</span>
                      <span className="text-white/60">是</span>
                      <span className="text-blue-300">{connectFrom?.nickname}</span>
                      <span className="text-white/60">的</span>
                      <span className="text-lg">{RELATION_CONFIG[rel].icon}</span>
                      <span className="font-semibold text-green-400">{RELATION_CONFIG[rel].label}</span>
                    </Button>
                  ))}
                </div>

                {/* Swap and back buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-blue-500/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const temp = connectFrom;
                      setConnectFrom(connectTo);
                      setConnectTo(temp);
                    }}
                    className="flex-1 text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/20"
                  >
                    🔄 交换 A 和 B
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConnectTo(null)}
                    className="flex-1 text-blue-300/60 hover:text-blue-300"
                  >
                    ← 重新选择
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Path Picker Dialog */}
      <Dialog open={showPathPicker} onOpenChange={(open) => {
        setShowPathPicker(open);
        if (!open) resetPathPicker();
      }}>
        <DialogContent className="bg-slate-900/95 border border-amber-500/30 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('pathPicker.title')}</DialogTitle>
            <DialogDescription className="text-amber-300/60">
              {t('pathPicker.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Path Display */}
            <div className="p-4 rounded-xl bg-white/5 border border-amber-500/20">
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm">
                  {t('pathPicker.start')}
                </span>
                {pathSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRightIcon className="h-4 w-4 text-amber-500/40" />
                    <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm">
                      {t(`relations.${step.relation}`)}
                    </span>
                  </div>
                ))}
                {pathSteps.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeLastStep}
                    className="ml-2 h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    撤销
                  </Button>
                )}
              </div>
            </div>

            {/* Relation Buttons */}
            <div>
              <p className="text-xs text-amber-300/40 mb-2">{t('pathPicker.selectRelation')}</p>
              <div className="grid grid-cols-3 gap-2">
                {(['father', 'mother', 'spouse', 'elder_brother', 'younger_brother', 'elder_sister', 'younger_sister', 'son', 'daughter'] as RelationType[]).map(rel => (
                  <Button
                    key={rel}
                    variant="outline"
                    onClick={() => addPathStep(rel, RELATION_CONFIG[rel].gender)}
                    className="justify-start gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-white"
                  >
                    <span className="text-lg">{RELATION_CONFIG[rel].icon}</span>
                    {t(`relations.${rel}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Result */}
            {pathResult && (
              <div className="space-y-3">
                <p className="text-xs text-amber-300/40">{t('pathPicker.result')}</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-amber-300/60 mb-1">{t('detail.iCallThem')}</p>
                      <p className="text-xl font-bold text-amber-300">{pathResult.term}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-300/60 mb-1">{t('detail.theyCallMe')}</p>
                      <p className="text-xl font-bold text-orange-300">{pathResult.reverse}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pathSteps.length > 0 && !pathResult && (
              <p className="text-center text-amber-300/60 py-4">
                未找到对应称呼，请继续添加关系或尝试其他路径
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
