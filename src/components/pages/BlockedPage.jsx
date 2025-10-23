import React from "react";

const BlockedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">❌ Your account is blocked!</h1>
      <p className="mt-4 text-gray-300">
        Please contact support or try again later.
      </p>
    </div>
  );
};

export default BlockedPage;