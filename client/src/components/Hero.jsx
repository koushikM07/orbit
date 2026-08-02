import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-black">

      <p className="text-orange-500 uppercase tracking-[8px] font-semibold">
        Welcome to Orbit
      </p>

      <h1 className="text-7xl font-black text-white mt-6 leading-tight">
        Discover.
        <br />
        Discuss.
        <br />
        Connect.
      </h1>

      <p className="text-slate-400 text-xl mt-8 max-w-3xl leading-9">
        Join communities, write reviews, discover amazing places,
        share your experiences and meet people who love the same
        things you do.
      </p>

      <div className="flex gap-6 mt-12">

        <Link to="/register">
          <button className="bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/20">
            Get Started
            <ArrowRight size={20}/>
          </button>
        </Link>

        <Link to="/">
          <button className="border border-slate-600 hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 px-8 py-4 rounded-xl text-white">
            Explore
          </button>
        </Link>

      </div>
        <div className="mt-20 flex gap-16 text-center">

  <div>
    <h2 className="text-4xl font-bold text-orange-500">10K+</h2>
    <p className="text-slate-400 mt-2">Community Members</p>
  </div>

  <div>
    <h2 className="text-4xl font-bold text-orange-500">50K+</h2>
    <p className="text-slate-400 mt-2">Reviews</p>
  </div>

  <div>
    <h2 className="text-4xl font-bold text-orange-500">100+</h2>
    <p className="text-slate-400 mt-2">Communities</p>
  </div>

</div>
    </section>
  );
}

export default Hero;