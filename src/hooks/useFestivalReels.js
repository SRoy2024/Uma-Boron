import { useEffect, useState } from 'react'
import { reelsData } from '../data/reels'
import { supabase } from '../lib/supabase'

const CHAPTERS = new Set(['mahalaya', 'panchami', 'shashthi', 'saptami', 'ashtami', 'navami', 'dashami'])
const SAFE_VIDEO_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'])
const SAFE_THUMBNAIL_HOSTS = new Set(['i.ytimg.com', 'img.youtube.com'])

function safeUrl(value, hosts) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && hosts.has(url.hostname) ? url.href : ''
  } catch {
    return ''
  }
}

function normalizeReel(row) {
  const chapterId = String(row.chapter_id || row.chapterId || '')
  const reelUrl = safeUrl(row.video_url || row.reelUrl, SAFE_VIDEO_HOSTS)
  if (!CHAPTERS.has(chapterId) || !reelUrl) return null
  return {
    id: String(row.id), chapterId, dayName: String(row.day_name || row.dayName || ''), title: String(row.title || ''),
    bengaliTitle: String(row.bengali_title || row.bengaliTitle || ''), creator: String(row.creator || ''),
    creatorName: String(row.creator_name || row.creatorName || row.creator || ''), location: String(row.location || ''), reelUrl,
    platform: String(row.platform || 'YouTube'), thumbnailUrl: safeUrl(row.thumbnail_url || row.thumbnailUrl, SAFE_THUMBNAIL_HOSTS),
    thumbnailGradient: String(row.thumbnail_gradient || row.thumbnailGradient || 'linear-gradient(135deg, #24150d, #78451e, #d9a441)'),
    tags: Array.isArray(row.tags) ? row.tags.map(String).slice(0, 6) : [], summary: String(row.summary || ''),
  }
}

export function useFestivalReels() {
  const [reels, setReels] = useState(() => reelsData.map(normalizeReel).filter(Boolean))
  const [source, setSource] = useState('fallback')

  useEffect(() => {
    if (!supabase) return undefined
    let cancelled = false
    supabase.from('festival_reels')
      .select('id, chapter_id, day_name, title, bengali_title, creator, creator_name, location, video_url, platform, thumbnail_url, thumbnail_gradient, tags, summary, position')
      .eq('is_active', true).order('position', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return
        const verified = data.map(normalizeReel).filter(Boolean)
        if (verified.length) { setReels(verified); setSource('live') }
      })
    return () => { cancelled = true }
  }, [])

  return { reels, source }
}

export { normalizeReel }
