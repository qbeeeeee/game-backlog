export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-widest text-white uppercase">
          My{" "}
          <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]">
            Retro
          </span>{" "}
          Profile
        </h1>

        <p className="mt-1 text-xs tracking-widest text-gray-600 uppercase">
          Manage your personal profile and account settings.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-widest text-white uppercase">
            Profile Information
          </h2>

          <p className="text-sm tracking-widest text-gray-600 uppercase">
            Update your personal information and account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
