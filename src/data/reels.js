// Verified public videos used only when the live Supabase feed is unavailable.
// The primary feed is the `festival_reels` table and can be updated without a deploy.

export const reelsData = [
  {
    id: 'mahalaya-chandipath', chapterId: 'mahalaya', dayName: 'Mahalaya',
    title: 'Original Chandipath in the voice of Birendra Krishna Bhadra', bengaliTitle: 'মহালয়ার ভোরে মহিষাসুরমর্দিনী',
    creator: 'Bangla Vision Desk', creatorName: 'Bangla Vision Desk', location: 'Bengal · Mahalaya dawn tradition',
    reelUrl: 'https://www.youtube.com/watch?v=pKevDoR-TeI', platform: 'YouTube', thumbnailUrl: 'https://i.ytimg.com/vi/pKevDoR-TeI/hqdefault.jpg',
    thumbnailGradient: 'linear-gradient(135deg, #1f140e 0%, #4a2c11 50%, #d48b38 100%)',
    tags: ['#Mahalaya', '#Chandipath', '#BirendraKrishnaBhadra'],
    summary: 'A full Mahalaya Chandipath recording for the pre-dawn ritual that begins Debipaksha across Bengal.',
  },
  {
    id: 'panchami-chokkhudaan', chapterId: 'panchami', dayName: 'Panchami', title: 'Maa Durga Chokkhu Daan before Mahalaya',
    bengaliTitle: 'কুমারটুলিতে দেবীর চক্ষুদান', creator: 'Explore With Bidisha', creatorName: 'Explore With Bidisha',
    location: 'Dumdum Kumartuli, Kolkata', reelUrl: 'https://www.youtube.com/watch?v=g3IAjDI5Ti0', platform: 'YouTube',
    thumbnailUrl: 'https://i.ytimg.com/vi/g3IAjDI5Ti0/hqdefault.jpg', thumbnailGradient: 'linear-gradient(135deg, #2b1d16 0%, #683820 50%, #c47d4e 100%)',
    tags: ['#Kumartuli', '#ChokkhuDaan', '#Panchami'], summary: 'A close look at the final artisan process as the eyes of the Durga pratima are painted.',
  },
  {
    id: 'shashthi-pandal-hopping', chapterId: 'shashthi', dayName: 'Shashthi', title: 'Kolkata Durga Puja: from rituals to pandal hopping',
    bengaliTitle: 'মহাষষ্ঠীর বোধন ও মণ্ডপ দর্শন', creator: 'Naveen Rawat', creatorName: 'Naveen Rawat', location: 'Kolkata, West Bengal',
    reelUrl: 'https://www.youtube.com/watch?v=MEuFFRRZUZo', platform: 'YouTube', thumbnailUrl: 'https://i.ytimg.com/vi/MEuFFRRZUZo/hqdefault.jpg',
    thumbnailGradient: 'linear-gradient(135deg, #2d0b0b 0%, #7d1c1c 50%, #d4a038 100%)', tags: ['#Shashthi', '#Bodhon', '#PandalHopping'],
    summary: 'A five-day Kolkata journey beginning with Shashthi rituals and the opening of the city’s pandals.',
  },
  {
    id: 'saptami-kola-bou', chapterId: 'saptami', dayName: 'Saptami', title: 'Maha Saptami Kola Bou Snan performed in Kolkata',
    bengaliTitle: 'সপ্তমী ভোরে নবপত্রিকা স্নান', creator: 'News On AIR Official', creatorName: 'News On AIR Official', location: 'Kolkata, West Bengal',
    reelUrl: 'https://www.youtube.com/watch?v=YSqYKEIZ2Os', platform: 'YouTube', thumbnailUrl: 'https://i.ytimg.com/vi/YSqYKEIZ2Os/hqdefault.jpg',
    thumbnailGradient: 'linear-gradient(135deg, #10261b 0%, #205c38 50%, #8ac47d 100%)', tags: ['#MahaSaptami', '#KolaBou', '#Navapatrika'],
    summary: 'News On AIR documents the dawn bathing ritual of the Navapatrika on Maha Saptami.',
  },
  {
    id: 'ashtami-anjali', chapterId: 'ashtami', dayName: 'Ashtami', title: 'Maha Ashtami Anjali in Kolkata', bengaliTitle: 'মহাষ্টমীর পুষ্পাঞ্জলি',
    creator: 'Adrija Roy', creatorName: 'Adrija Roy', location: 'Kolkata, West Bengal', reelUrl: 'https://www.youtube.com/watch?v=CbNIJF37RWU',
    platform: 'YouTube', thumbnailUrl: 'https://i.ytimg.com/vi/CbNIJF37RWU/hqdefault.jpg',
    thumbnailGradient: 'linear-gradient(135deg, #2b111a 0%, #6d1b32 50%, #e0b64c 100%)', tags: ['#MahaAshtami', '#Pushpanjali', '#Kolkata'],
    summary: 'A personal view of the devotion, flowers, and family gathering around Maha Ashtami Anjali.',
  },
  {
    id: 'navami-dhunuchi-naach', chapterId: 'navami', dayName: 'Navami', title: 'Dhunuchi Naach with live dhaak beats',
    bengaliTitle: 'নবমীর ধুনুচি নাচ ও সন্ধ্যা আরতি', creator: 'Sneha Ghosh', creatorName: 'Sneha Ghosh', location: 'Rilbong Puja, Shillong',
    reelUrl: 'https://www.youtube.com/watch?v=fikIhTLhv1w', platform: 'YouTube', thumbnailUrl: 'https://i.ytimg.com/vi/fikIhTLhv1w/hqdefault.jpg',
    thumbnailGradient: 'linear-gradient(135deg, #260a00 0%, #6d2400 50%, #ff8c1a 100%)', tags: ['#DhunuchiNaach', '#Navami', '#Dhaak'],
    summary: 'A live Navami-evening dhunuchi dance performed before Maa Durga to the rhythm of dhaak.',
  },
  {
    id: 'dashami-sindoor-visarjan', chapterId: 'dashami', dayName: 'Dashami', title: 'Vijaya Dashami: Sindoor Khela and Visarjan in Kolkata',
    bengaliTitle: 'সিঁদুর খেলা থেকে বিসর্জন', creator: 'Delhi Food Walks', creatorName: 'Delhi Food Walks', location: 'Bagbazar and North Kolkata',
    reelUrl: 'https://www.youtube.com/watch?v=_LSeEUcEbGc', platform: 'YouTube', thumbnailUrl: 'https://i.ytimg.com/vi/_LSeEUcEbGc/hqdefault.jpg',
    thumbnailGradient: 'linear-gradient(135deg, #101c2d 0%, #1c3d5c 50%, #e8a25c 100%)', tags: ['#BijoyaDashami', '#SindoorKhela', '#Visarjan'],
    summary: 'A verified creator’s documentary journey through Sindoor Khela, community meals, and the final immersion.',
  },
]
