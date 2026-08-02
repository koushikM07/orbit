function TopicCard({ icon, title, description }) {
  return (
    <div className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500 rounded-2xl p-8 transition duration-300 hover:-translate-y-3 cursor-pointer">

      <div className="text-5xl mb-5">
        {icon}
      </div>

      <h2 className="text-white text-2xl font-bold">
        {title}
      </h2>

      <p className="text-slate-400 mt-4">
        {description}
      </p>

    </div>
  );
}

export default TopicCard;