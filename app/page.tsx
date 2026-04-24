import { ImageGenerator } from '@/components/image-generator';

export default function Page() {
  return (
    <div className="h-screen w-full flex flex-col bg-white">
      <header className="h-16 border-b border-zinc-200 flex items-center px-6 shrink-0 z-20 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter">
            T
          </div>
          <h1 className="font-semibold text-lg tracking-tight text-zinc-900">텍스트 이미지 생성기</h1>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ImageGenerator />
      </div>
    </div>
  );
}
