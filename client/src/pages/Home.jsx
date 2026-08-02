import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TopicCard from "../components/TopicCard";
import "../App.css";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">

  <TopicCard
    icon="🎬"
    title="Movies"
    description="Reviews, ratings and discussions"
  />

  <TopicCard
    icon="💻"
    title="Technology"
    description="AI, Gadgets and Programming"
  />

  <TopicCard
    icon="✈️"
    title="Travel"
    description="Places, stories and adventures"
  />

  <TopicCard
    icon="🍕"
    title="Food"
    description="Restaurants and recipes"
  />

</div>
    </>
  );
}

export default Home;