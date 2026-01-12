
import React, { useEffect, useState, useRef } from 'react';
import { ReelContent } from '../types';
import { generateReelImage, generateSpeech } from '../services/geminiService';
import InteractionOverlay from './InteractionOverlay';

interface Props {
  reel: ReelContent;
  isActive: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
}

const Reel: React.FC<Props> = ({ reel, isActive, isSaved, onToggleSave }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(reel.imageUrl || null);
  const [loading, setLoading] = useState(!reel.imageUrl);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!imageUrl && isActive) {
      const loadImage = async () => {
        const url = await generateReelImage(reel.imagePrompt);
        setImageUrl(url);
        setLoading(false);
      };
      loadImage();
    }
  }, [isActive, imageUrl, reel.imagePrompt]);

  useEffect(() => {
    if (isActive && !loading) {
      handleAudio();
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isActive, loading]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
  };

  const handleAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const textToSpeak = `${reel.title}. ${reel.content}`;
    const base64Audio = await generateSpeech(textToSpeak);
    
    if (base64Audio && audioContextRef.current) {
      const audioData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      
      stopAudio();
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      audioSourceRef.current = source;
    }
  };

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  return (
    <div className="snap-item flex flex-col justify-end">
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/50 animate-pulse font-medium">Visualizing {reel.type.toLowerCase()}...</p>
            </div>
          </div>
        ) : (
          <img 
            src={imageUrl || 'https://picsum.photos/1080/1920'} 
            className="w-full h-full object-cover opacity-80" 
            alt={reel.title}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      </div>

      <div className="relative z-10 w-full pb-24 flex flex-col">
        {isActive && (
          <div className="animate-slide-up">
            <InteractionOverlay reel={reel} />
          </div>
        )}
      </div>

      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20 items-center">
        <button onClick={onToggleSave} className="flex flex-col items-center group">
          <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center group-active:scale-90 transition-all ${isSaved ? 'bg-indigo-600' : 'bg-white/10'}`}>
            <i className={`fas fa-bookmark text-xl ${isSaved ? 'text-white' : 'text-white/70'}`}></i>
          </div>
          <span className="text-xs mt-1 text-white font-medium">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        <button className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:scale-90 transition-transform">
            <i className="fas fa-heart text-white text-xl"></i>
          </div>
          <span className="text-xs mt-1 text-white font-medium">Like</span>
        </button>
        <button className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:scale-90 transition-transform">
            <i className="fas fa-comment text-white text-xl"></i>
          </div>
          <span className="text-xs mt-1 text-white font-medium">Ideas</span>
        </button>
        <button className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:scale-90 transition-transform">
            <i className="fas fa-share text-white text-xl"></i>
          </div>
          <span className="text-xs mt-1 text-white font-medium">Share</span>
        </button>
      </div>
    </div>
  );
};

export default Reel;
