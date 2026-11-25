'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Frame editor entry point. Arriving with task_uuid + member_job_uuid
 * already known (deep-linked from job-overview's Frame tile) skips straight
 * to import. Arriving bare (More menu, doc/Influencer Pro
 * 09_Frame_Editor_00_Select_Job mockup) goes to the job-picker first, since
 * frames are job-specific (§30) and there's no job in context yet.
 */
function FrameEditorEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const taskUuid = searchParams.get('task_uuid');
    const memberJobUuid = searchParams.get('member_job_uuid');
    if (taskUuid && memberJobUuid) {
      router.replace(`/more/frame-editor/import?${searchParams.toString()}`);
    } else {
      router.replace('/more/frame-editor/select-job');
    }
  }, [router, searchParams]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#07050E] text-white text-xs">
      <div className="w-6 h-6 border-2 border-[#762CFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function FrameEditorEntryPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-[#07050E] text-white text-xs">Loading...</div>}>
      <FrameEditorEntryContent />
    </Suspense>
  );
}
