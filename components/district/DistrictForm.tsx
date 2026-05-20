'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useElection } from '@/hooks/useElection';
import { useSido, useSigungu } from '@/hooks/useDistrict';
import { useUserStore } from '@/stores/userStore';
import { Card } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { EarlyVotingNotice } from './EarlyVotingNotice';
import type { Sigungu } from '@/types/domain';

export function DistrictForm() {
  const router = useRouter();
  const checkboxId = useId();

  const { election } = useElection();
  const { sidos } = useSido();

  const [selectedSidoCode, setSelectedSidoCode] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<Sigungu | null>(null);
  const [isResidenceDifferent, setIsResidenceDifferent] = useState(false);

  const selectedSidoName = selectedSidoCode
    ? sidos.find((s) => s.code === selectedSidoCode)?.name ?? null
    : null;
  const { sigungus, isLoading: sigunguLoading } = useSigungu(
    election?.id ?? null,
    selectedSidoName
  );

  const district = useUserStore((s) => s.district);
  const setDistrict = useUserStore((s) => s.setDistrict);
  const setResidenceDifferent = useUserStore((s) => s.setResidenceDifferent);

  const sidoOptions = sidos.map((s) => ({ value: s.code, label: s.name }));
  const sigunguOptions = sigungus.map((s) => ({ value: s.code, label: s.name }));

  const noElection = !election;
  const canSubmit = !!selectedSidoCode && !!selectedSigungu;

  function handleSidoChange(code: string) {
    setSelectedSidoCode(code);
    setSelectedSigungu(null);
  }

  function handleSigunguChange(code: string) {
    const found = sigungus.find((s) => s.code === code) ?? null;
    setSelectedSigungu(found);
  }

  function handleSubmit() {
    if (!selectedSigungu || !selectedSidoCode) return;
    const sido = sidos.find((s) => s.code === selectedSidoCode);
    if (!sido) return;
    setDistrict({ sido, sigungu: selectedSigungu });
    setResidenceDifferent(isResidenceDifferent);
    router.push('/polling-stations');
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 이미 설정된 선거구 */}
      {district && (
        <Card variant="default">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[length:var(--font-size-label)] text-text-secondary uppercase tracking-[var(--letter-spacing-label)]">
                현재 설정된 선거구
              </p>
              <p className="text-[length:var(--font-size-body)] text-text-primary font-medium">
                {district.sido.name} {district.sigungu.name}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 주소 입력 카드 */}
      <Card variant="default">
        <div className="flex flex-col gap-3">
          <Dropdown
            value={selectedSidoCode}
            onChange={handleSidoChange}
            options={sidoOptions}
            placeholder="시/도 선택"
            ariaLabel="시/도 선택"
          />
          <Dropdown
            value={selectedSigungu?.code ?? null}
            onChange={handleSigunguChange}
            options={sigunguOptions}
            placeholder={noElection ? '선거 정보를 불러올 수 없어요' : '시/군/구 선택'}
            disabled={!selectedSidoCode || noElection}
            loading={sigunguLoading}
            ariaLabel="시/군/구 선택"
          />
        </div>
      </Card>

      {/* 거주지 불일치 체크박스 */}
      <label
        htmlFor={checkboxId}
        className="flex items-center gap-3 min-h-touch-min px-1 cursor-pointer"
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={isResidenceDifferent}
          onChange={(e) => setIsResidenceDifferent(e.target.checked)}
          className="w-5 h-5 accent-[var(--color-brand)] cursor-pointer"
        />
        <span className="text-[length:var(--font-size-body)] text-text-primary">
          현재 거주지가 주민등록 주소와 달라요
        </span>
      </label>

      {/* 사전투표 안내 박스 */}
      {isResidenceDifferent && <EarlyVotingNotice />}

      {/* 설정 완료 버튼 */}
      <Button
        variant="primary"
        fullWidth
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        설정 완료 · 투표소 찾기
      </Button>
    </div>
  );
}
