'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import type {
  FamilyMember,
  FamilyRelation,
  RelationType,
  GenderType,
  AvatarType,
  CreateFamilyMemberInput,
  CreateFamilyRelationInput,
} from '@/lib/supabase/family-tree';

interface FamilyTreeEditorProps {
  applicationId: string;
}

// Avatar icons based on type
const AVATAR_ICONS: Record<AvatarType, string> = {
  elder_male: '👴',
  elder_female: '👵',
  adult_male: '👨',
  adult_female: '👩',
  youth_male: '👦',
  youth_female: '👧',
  child: '👶',
};

const AVATAR_TYPES: AvatarType[] = [
  'elder_male',
  'elder_female',
  'adult_male',
  'adult_female',
  'youth_male',
  'youth_female',
  'child',
];

const RELATION_TYPES: RelationType[] = ['father', 'mother', 'son', 'daughter', 'spouse'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FamilyTreeEditor({ applicationId }: FamilyTreeEditorProps) {
  const t = useTranslations('familyTree.edit');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relations, setRelations] = useState<FamilyRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formNickname, setFormNickname] = useState('');
  const [formRealName, setFormRealName] = useState('');
  const [formGender, setFormGender] = useState<GenderType>('male');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formAvatarType, setFormAvatarType] = useState<AvatarType>('adult_male');
  const [formNotes, setFormNotes] = useState('');
  const [formIsSelf, setFormIsSelf] = useState(false);

  // Relation form state
  const [relationFromId, setRelationFromId] = useState('');
  const [relationToId, setRelationToId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('father');

  const selfMember = members.find(m => m.is_self);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      const response = await fetch('/api/family/tree');
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

  const resetForm = () => {
    setFormNickname('');
    setFormRealName('');
    setFormGender('male');
    setFormBirthDate('');
    setFormAvatarType('adult_male');
    setFormNotes('');
    setFormIsSelf(false);
    setEditingMember(null);
  };

  const openAddSelfForm = () => {
    resetForm();
    setFormNickname('我');
    setFormIsSelf(true);
    setShowMemberForm(true);
  };

  const openAddMemberForm = () => {
    resetForm();
    setShowMemberForm(true);
  };

  const openEditForm = (member: FamilyMember) => {
    setEditingMember(member);
    setFormNickname(member.nickname);
    setFormRealName(member.real_name || '');
    setFormGender(member.gender);
    setFormBirthDate(member.birth_date || '');
    setFormAvatarType(member.avatar_type);
    setFormNotes(member.notes || '');
    setFormIsSelf(member.is_self);
    setShowMemberForm(true);
  };

  const handleSaveMember = async () => {
    if (!formNickname.trim()) {
      toast.error(t('errors.nicknamRequired'));
      return;
    }

    setIsSaving(true);

    try {
      if (editingMember) {
        // Update existing member
        const response = await fetch(`/api/family/members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: formNickname,
            real_name: formRealName || null,
            gender: formGender,
            birth_date: formBirthDate || null,
            avatar_type: formAvatarType,
            notes: formNotes || null,
          }),
        });

        if (response.ok) {
          toast.success(t('success.memberUpdated'));
          loadFamilyData();
          setShowMemberForm(false);
          resetForm();
        } else {
          throw new Error('Failed to update member');
        }
      } else {
        // Create new member
        const input: CreateFamilyMemberInput = {
          nickname: formNickname,
          real_name: formRealName || undefined,
          gender: formGender,
          birth_date: formBirthDate || undefined,
          avatar_type: formAvatarType,
          notes: formNotes || undefined,
          is_self: formIsSelf,
        };

        const response = await fetch('/api/family/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (response.ok) {
          toast.success(t('success.memberCreated'));
          loadFamilyData();
          setShowMemberForm(false);
          resetForm();
        } else {
          throw new Error('Failed to create member');
        }
      }
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (!confirm('确定要删除此成员吗？相关的关系也会被删除。')) {
      return;
    }

    try {
      const response = await fetch(`/api/family/members/${member.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(t('success.memberDeleted'));
        loadFamilyData();
      } else {
        throw new Error('Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('删除失败');
    }
  };

  const handleSaveRelation = async () => {
    if (!relationFromId || !relationToId) {
      toast.error(t('errors.memberRequired'));
      return;
    }

    setIsSaving(true);

    try {
      const input: CreateFamilyRelationInput = {
        from_member_id: relationFromId,
        to_member_id: relationToId,
        relation_type: relationType,
      };

      const response = await fetch('/api/family/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        toast.success(t('success.relationCreated'));
        loadFamilyData();
        setShowRelationForm(false);
        setRelationFromId('');
        setRelationToId('');
      } else {
        throw new Error('Failed to create relation');
      }
    } catch (error) {
      console.error('Error saving relation:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRelation = async (relationId: string) => {
    try {
      const response = await fetch(`/api/family/relations/${relationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadFamilyData();
      }
    } catch (error) {
      console.error('Error deleting relation:', error);
    }
  };

  // Get relation display text
  const getRelationDisplay = (relation: FamilyRelation) => {
    const from = members.find(m => m.id === relation.from_member_id);
    const to = members.find(m => m.id === relation.to_member_id);
    if (!from || !to) return '';
    return `${from.nickname} → ${t(`relations.${relation.relation_type}`)} → ${to.nickname}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-3xl animate-pulse">🌳</span>
          </div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/apps" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            {t('buttons.backToApps')}
          </Link>
        </Button>
      </div>

      {/* Add Self Prompt */}
      {!selfMember && (
        <Card className="p-6 border-dashed border-2 border-amber-500/30 bg-amber-500/5">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <UserPlusIcon className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">{t('addSelf')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('addSelfDescription')}</p>
            <Button onClick={openAddSelfForm} className="gap-2 bg-amber-600 hover:bg-amber-500">
              <PlusIcon className="h-4 w-4" />
              {t('addSelf')}
            </Button>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {selfMember && (
        <div className="flex gap-3">
          <Button onClick={openAddMemberForm} className="gap-2 bg-amber-600 hover:bg-amber-500">
            <PlusIcon className="h-4 w-4" />
            {t('addMember')}
          </Button>
          <Button onClick={() => setShowRelationForm(true)} variant="outline" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            添加关系
          </Button>
        </div>
      )}

      {/* Members List */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">{t('memberList')}</h2>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noMembers')}</p>
            <p className="text-sm">{t('noMembersDescription')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => {
              const memberRelations = relations.filter(
                r => r.from_member_id === member.id || r.to_member_id === member.id
              );

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center text-2xl">
                      {AVATAR_ICONS[member.avatar_type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.nickname}</span>
                        {member.is_self && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-xs">
                            我
                          </span>
                        )}
                      </div>
                      {member.real_name && (
                        <p className="text-sm text-muted-foreground">{member.real_name}</p>
                      )}
                      {memberRelations.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {memberRelations.length} 个关系
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditForm(member)}
                      className="h-8 w-8"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    {!member.is_self && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMember(member)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Relations List */}
      {relations.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">关系列表</h2>
          <div className="space-y-2">
            {relations.map(relation => (
              <div
                key={relation.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <span className="text-sm">{getRelationDisplay(relation)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRelation(relation.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Member Form Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingMember ? '编辑成员' : formIsSelf ? t('addSelf') : t('addMember')}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowMemberForm(false);
                    resetForm();
                  }}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>{t('form.nickname')}</Label>
                  <Input
                    value={formNickname}
                    onChange={e => setFormNickname(e.target.value)}
                    placeholder={t('form.nicknamePlaceholder')}
                  />
                </div>

                <div>
                  <Label>{t('form.realName')}</Label>
                  <Input
                    value={formRealName}
                    onChange={e => setFormRealName(e.target.value)}
                    placeholder={t('form.realNamePlaceholder')}
                  />
                </div>

                <div>
                  <Label>{t('form.gender')}</Label>
                  <Select value={formGender} onValueChange={v => setFormGender(v as GenderType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('form.male')}</SelectItem>
                      <SelectItem value="female">{t('form.female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('form.birthDate')}</Label>
                  <Input
                    type="date"
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>{t('form.avatar')}</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {AVATAR_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormAvatarType(type)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formAvatarType === type
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-transparent bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <span className="text-2xl">{AVATAR_ICONS[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t('form.notes')}</Label>
                  <Textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder={t('form.notesPlaceholder')}
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMemberForm(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    {t('buttons.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveMember}
                    disabled={isSaving}
                    className="flex-1 bg-amber-600 hover:bg-amber-500"
                  >
                    {isSaving ? t('buttons.saving') : t('buttons.save')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Relation Form Modal */}
      {showRelationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">添加关系</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRelationForm(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>{t('form.selectMember')} (从)</Label>
                  <Select value={relationFromId} onValueChange={setRelationFromId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择成员" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {AVATAR_ICONS[m.avatar_type]} {m.nickname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('form.relationType')}</Label>
                  <Select value={relationType} onValueChange={v => setRelationType(v as RelationType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {t(`relations.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('form.selectMember')} (到)</Label>
                  <Select value={relationToId} onValueChange={setRelationToId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择成员" />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter(m => m.id !== relationFromId)
                        .map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {AVATAR_ICONS[m.avatar_type]} {m.nickname}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRelationForm(false)}
                    className="flex-1"
                  >
                    {t('buttons.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveRelation}
                    disabled={isSaving}
                    className="flex-1 bg-amber-600 hover:bg-amber-500"
                  >
                    {isSaving ? t('buttons.saving') : t('buttons.save')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
