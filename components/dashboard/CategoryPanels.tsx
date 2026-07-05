import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCategory } from "@/lib/dashboard-categories";

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-gray-800/70 bg-gray-900/50">
      <CardContent>
        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">
          {label}
        </p>
        <p className="mt-2 text-xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function MoviesPanel() {
  const movies = [
    { title: "Blade Runner 2049", mood: "Sci-Fi Noir", runtime: "164 min" },
    { title: "Whiplash", mood: "Intense", runtime: "106 min" },
    { title: "The Grand Budapest Hotel", mood: "Stylized", runtime: "100 min" },
    { title: "Past Lives", mood: "Romance Drama", runtime: "106 min" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricTile label="Watchlist" value="24 titles" />
        <MetricTile label="Weekend Picks" value="6 ready" />
        <MetricTile label="Avg Runtime" value="122 min" />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {movies.map((movie) => (
          <Card key={movie.title} className="border-gray-800/70 bg-gray-950/70">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                {movie.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-cyan-500/40 text-cyan-300"
              >
                {movie.mood}
              </Badge>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                {movie.runtime}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function SeriesPanel() {
  const series = [
    { name: "Severance", season: "S2", progress: 78 },
    { name: "The Bear", season: "S3", progress: 55 },
    { name: "Dark", season: "S1", progress: 36 },
    { name: "Shogun", season: "S1", progress: 90 },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricTile label="Following" value="12 shows" />
        <MetricTile label="Current Season" value="4 active" />
        <MetricTile label="Episodes Left" value="31" />
      </section>

      <Card className="border-gray-800/70 bg-gray-950/70">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Season tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {series.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{item.name}</span>
                <span className="text-gray-500">{item.season}</span>
              </div>
              <div className="h-2 rounded bg-gray-900">
                <div
                  className="h-2 rounded bg-cyan-500"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AnimesPanel() {
  const queue = [
    { title: "Frieren", arc: "Northern Lands", studio: "Madhouse" },
    { title: "Dandadan", arc: "Turbo Granny", studio: "Science SARU" },
    { title: "Vinland Saga", arc: "Farmland", studio: "MAPPA" },
    { title: "Haikyuu!!", arc: "Nationals", studio: "Production I.G" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-purple-500/30 bg-linear-to-r from-purple-950/40 via-gray-950 to-cyan-950/30 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-purple-300">
          Anime queue
        </p>
        <p className="mt-2 text-sm text-gray-300">
          Focus board for long arcs, seasonal drops, and studio follow-ups.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {queue.map((anime) => (
          <Card key={anime.title} className="border-gray-800/70 bg-gray-950/80">
            <CardContent>
              <p className="text-base font-bold text-white">{anime.title}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                {anime.arc}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Studio: {anime.studio}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function YoutubePanel() {
  const channels = [
    { name: "Fireship", queue: "React 19 + Next 16", type: "Dev" },
    { name: "Noclip", queue: "Studio documentaries", type: "Gaming" },
    {
      name: "Every Frame a Painting",
      queue: "Visual storytelling",
      type: "Film",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricTile label="Saved Videos" value="148" />
        <MetricTile label="Watch Later" value="39" />
        <MetricTile label="Learning Queue" value="22" />
      </section>
      <Card className="border-gray-800/70 bg-gray-950/70">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Channel deep-dive
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.name}
              className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{channel.name}</p>
                <p className="text-sm text-gray-400">{channel.queue}</p>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-purple-500/40 text-purple-300"
              >
                {channel.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function CategoryPanels({ category }: { category: DashboardCategory }) {
  if (category === "games") {
    return <DashboardContent category={category} />;
  }

  if (category === "movies") {
    return <MoviesPanel />;
  }

  if (category === "series") {
    return <SeriesPanel />;
  }

  if (category === "animes") {
    return <AnimesPanel />;
  }

  return <YoutubePanel />;
}
