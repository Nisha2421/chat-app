import React from 'react'

export const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-500 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center h-screen w-screen z-50">
          <div className="animate-spin rounded-full h-24 w-24 border-[10px] border-t-blue-500 border-solid" />
          <p className="text-5xl font-semibold text-white">loading...</p>
        </div>{" "}
      </div>
  )
}
