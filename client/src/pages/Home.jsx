import Hero from "../components/Hero";
import TopicCard from "../components/TopicCard";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">


      {/* Hero Section */}
      <Hero />

      {/* Trending Topics */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            🔥 Trending Topics
          </h2>

          <p className="text-slate-400 mt-2">
            Explore what people are talking about
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <Link to="/movies">
  <TopicCard
    emoji="🎬"
    title="Movies"
    description="Discuss movies, reviews and recommendations."
  />
</Link>

          <TopicCard
            emoji="💻"
            title="Technology"
            description="Talk about coding, AI, gadgets and tech."
          />

          <TopicCard
            emoji="✈️"
            title="Travel"
            description="Share destinations, experiences and travel tips."
          />

          <TopicCard
            emoji="🍕"
            title="Food"
            description="Discover recipes, restaurants and food experiences."
          />

        </div>

      </section>

      {/* Recent Discussions */}
      <section className="max-w-5xl mx-auto px-6 pb-20">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h2 className="text-3xl font-bold">
              💬 Recent Discussions
            </h2>

            <p className="text-slate-400 mt-2">
              Join the conversation
            </p>
          </div>

          <button className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg font-semibold transition">
            View All
          </button>

        </div>

        {/* Discussion 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4 hover:border-orange-500 transition cursor-pointer">

          <div className="flex justify-between">

            <div>
              <span className="text-orange-500 text-sm font-semibold">
                🎬 MOVIES
              </span>

              <h3 className="text-xl font-semibold mt-2">
                What is the best movie you watched recently?
              </h3>

              <p className="text-slate-400 mt-2">
                Let's share some movie recommendations...
              </p>
            </div>

            <span className="text-slate-500 text-sm">
              2h ago
            </span>

          </div>

          <div className="flex gap-6 mt-5 text-slate-400 text-sm">
            <span>❤️ 24</span>
            <span>💬 12</span>
            <span>👤 Koushik</span>
          </div>

        </div>

        {/* Discussion 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500 transition cursor-pointer">

          <div className="flex justify-between">

            <div>
              <span className="text-orange-500 text-sm font-semibold">
                💻 TECHNOLOGY
              </span>

              <h3 className="text-xl font-semibold mt-2">
                What technology should every developer learn?
              </h3>

              <p className="text-slate-400 mt-2">
                Java, JavaScript, Python, cloud or something else?
              </p>
            </div>

            <span className="text-slate-500 text-sm">
              5h ago
            </span>

          </div>

          <div className="flex gap-6 mt-5 text-slate-400 text-sm">
            <span>❤️ 18</span>
            <span>💬 7</span>
            <span>👤 Alex</span>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;