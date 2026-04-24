'use client';

import React, { useState, useRef, useCallback } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import download from 'downloadjs';
import { Settings, Download, Type, Palette, Layout, SlidersHorizontal, Image as ImageIcon, Upload } from 'lucide-react';
import { fontOptions } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type Format = 'png' | 'jpeg' | 'svg';
type SizeMode = 'auto' | 'manual';

interface CustomFont {
  id: string;
  name: string;
  base64: string;
}

export function ImageGenerator() {
  const [text, setText] = useState('여기에 글자를 입력하세요');
  const [selectedFontId, setSelectedFontId] = useState(`google:${fontOptions[0].name}`);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const fontInputRef = useRef<HTMLInputElement>(null);
  
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(48);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>('auto');
  const [manualWidth, setManualWidth] = useState(800);
  const [manualHeight, setManualHeight] = useState(400);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<Format>('png');
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's a font
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newFont: CustomFont = {
        id: `customF_${Date.now()}`,
        name: file.name,
        base64,
      };
      setCustomFonts(prev => [...prev, newFont]);
      setSelectedFontId(newFont.id);
    };
    reader.readAsDataURL(file);
    
    if (fontInputRef.current) {
      fontInputRef.current.value = '';
    }
  };

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);

    try {
      const node = previewRef.current;
      
          const options = {
            pixelRatio: scale,
            style: { margin: '0' },
            fontEmbedCSS: '', // Try to let html-to-image embed correctly or at least avoid crashes
            backgroundColor: isTransparent && format !== 'jpeg' ? 'rgba(0,0,0,0)' : bgColor,
          };

          const filenameText = text.trim().replace(/[\n\r]/g, ' ').replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').replace(/\s+/g, '_') || 'image';
      const maxLenName = filenameText.length > 30 ? filenameText.slice(0, 30) : filenameText;
      const filename = `${maxLenName}.${format === 'jpeg' ? 'jpg' : format}`;

      if (format === 'png') {
        const dataUrl = await toPng(node, options);
        download(dataUrl, filename);
      } else if (format === 'jpeg') {
        const jpegOptions = { ...options, backgroundColor: isTransparent ? '#ffffff' : bgColor, quality: 0.95 };
        const dataUrl = await toJpeg(node, jpegOptions);
        download(dataUrl, filename);
      } else if (format === 'svg') {
        const dataUrl = await toSvg(node, options);
        download(dataUrl, filename);
      }
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  }, [text, bgColor, isTransparent, scale, format]);

  const isCustomFont = selectedFontId.startsWith('customF_');
  const customFont = isCustomFont ? customFonts.find(f => f.id === selectedFontId) : null;
  const googleFontName = selectedFontId.replace('google:', '');
  const googleFont = !isCustomFont ? fontOptions.find(f => f.name === googleFontName) : null;

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] bg-zinc-50 border-t border-zinc-200">
      {/* Controls Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-zinc-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-zinc-500" />
            이미지 설정
          </h2>
          
          <div className="space-y-5">
            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                <Type className="w-4 h-4" />
                글자
              </label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none transition-all"
                rows={4}
                placeholder="글자를 입력하세요..."
              />
            </div>

            {/* Font Select */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                  <Type className="w-4 h-4" />
                  글꼴
                </label>
                <button 
                  onClick={() => fontInputRef.current?.click()}
                  className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1.5 rounded-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  폰트 업로드
                </button>
                <input 
                  type="file" 
                  ref={fontInputRef} 
                  className="hidden" 
                  accept=".ttf,.otf,.woff,.woff2" 
                  onChange={handleFontUpload} 
                />
              </div>
              <select 
                value={selectedFontId}
                onChange={(e) => setSelectedFontId(e.target.value)}
                className="w-full p-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-zinc-700 bg-white"
              >
                <optgroup label="기본 폰트">
                  {fontOptions.map((f, i) => (
                    <option key={`google:${f.name}`} value={`google:${f.name}`}>{f.name}</option>
                  ))}
                </optgroup>
                {customFonts.length > 0 && (
                  <optgroup label="업로드된 폰트">
                    {customFonts.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                <Palette className="w-4 h-4" />
                색상
              </label>
              
              <div className="flex items-center justify-between p-2 lg:p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-600">글자 색상</span>
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
              </div>

              <div className="p-2 lg:p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">배경 색상</span>
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    disabled={isTransparent}
                    className={cn(
                      "w-8 h-8 rounded cursor-pointer border-0 p-0",
                      isTransparent && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-zinc-200">
                  <input 
                    type="checkbox" 
                    checked={isTransparent}
                    onChange={(e) => setIsTransparent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-zinc-600">배경 투명하게 (PNG, SVG 전용)</span>
                </label>
              </div>
            </div>

            {/* Size & Layout */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                <Layout className="w-4 h-4" />
                크기 및 레이아웃
              </label>

              <div className="flex items-center justify-between p-2 lg:p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-600">글자 크기 (px)</span>
                <input 
                  type="number" 
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-20 p-1.5 border border-zinc-300 rounded text-right text-sm"
                  min="1"
                />
              </div>

              <div className="p-2 lg:p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">배경 크기 모드</span>
                  <select 
                    value={sizeMode}
                    onChange={(e) => setSizeMode(e.target.value as SizeMode)}
                    className="p-1 border border-zinc-300 rounded text-sm bg-white"
                  >
                    <option value="auto">텍스트에 맞춤 (자동)</option>
                    <option value="manual">상세 설정 (수동)</option>
                  </select>
                </div>
                
                {sizeMode === 'manual' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
                    <div className="flex-1">
                      <span className="text-xs text-zinc-500 block mb-1">너비 (px)</span>
                      <input 
                        type="number" 
                        value={manualWidth}
                        onChange={(e) => setManualWidth(Number(e.target.value))}
                        className="w-full p-1.5 border border-zinc-300 rounded text-sm"
                        min="10"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-zinc-500 block mb-1">높이 (px)</span>
                      <input 
                        type="number" 
                        value={manualHeight}
                        onChange={(e) => setManualHeight(Number(e.target.value))}
                        className="w-full p-1.5 border border-zinc-300 rounded text-sm"
                        min="10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Settings */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                <SlidersHorizontal className="w-4 h-4" />
                출력 설정
              </label>

              <div className="flex items-center justify-between p-2 lg:p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-600">포맷</span>
                <div className="flex gap-2">
                  {(['png', 'jpeg', 'svg'] as Format[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md uppercase transition-colors",
                        format === fmt ? "bg-blue-600 text-white shadow-sm" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      )}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 lg:p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                <span className="text-sm text-zinc-600">해상도 스케일</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map(s => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                        scale === s ? "bg-blue-600 text-white shadow-sm" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleDownload}
              disabled={isExporting || !text.trim()}
              className={cn(
                "w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-white shadow-md transition-all mt-6",
                isExporting || !text.trim() ? "bg-zinc-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
              )}
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  렌더링 중...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  다운로드 ({scale}x {format.toUpperCase()})
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 relative overflow-auto bg-[url('https://grid-pattern.vercel.app/pattern.svg')] flex items-center justify-center p-8 bg-zinc-100/50">
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-zinc-500 shadow-sm border border-zinc-200 flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          실시간 미리보기
        </div>

        {/* The active canvas element that receives the styling */}
        <div 
          className="shadow-2xl transition-all relative container-to-export overflow-hidden flex items-center justify-center text-center"
          style={{
            backgroundColor: isTransparent ? 'transparent' : bgColor,
            width: sizeMode === 'manual' ? `${manualWidth}px` : 'auto',
            height: sizeMode === 'manual' ? `${manualHeight}px` : 'auto',
            minWidth: sizeMode === 'auto' ? '64px' : undefined,
            minHeight: sizeMode === 'auto' ? '64px' : undefined,
            padding: sizeMode === 'auto' ? '32px' : '0',
            /** A subtle checkerboard pattern only visible in preview when transparent */
            ...(isTransparent ? {
              backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/ENExRQAzhMEmMHAziE0Q2MFhBAAa0Q0xH532SAAAAABJRU5ErkJggg==")',
              backgroundRepeat: 'repeat',
            } : {})
          }}
        >
          {/* Target Element for Image generation. We wrap it again to ensure the checkered background 
              doesn't end up in the final PNG if we isolate it. */}
          <div
            ref={previewRef}
            className="flex items-center justify-center break-words whitespace-pre-wrap leading-tight"
            style={{
              backgroundColor: isTransparent ? 'transparent' : bgColor,
              color: textColor,
              fontSize: `${textSize}px`,
              fontFamily: isCustomFont ? `'${customFont?.id}', sans-serif` : 'inherit',
              width: sizeMode === 'manual' ? `${manualWidth}px` : 'auto',
              height: sizeMode === 'manual' ? `${manualHeight}px` : 'auto',
              padding: sizeMode === 'auto' ? '32px' : '0',
            }}
          >
            {customFont && (
              <style dangerouslySetInnerHTML={{
                __html: `
                  @font-face {
                    font-family: '${customFont.id}';
                    src: url('${customFont.base64}');
                  }
                `
              }} />
            )}
            <span className={googleFont?.className}>{text}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

// Ensure the icon is imported properly or replace SettingsIcon directly
const SettingsIcon = Settings;
