import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'react-feather';
import { useState } from 'react';
import Markdown from 'markdown-to-jsx';


export const FeedbackPage = (
  { header, interviewTitle, serverFeedback, items }: {
    header: React.ReactNode, interviewTitle: string, serverFeedback?: string, items: any[]
  }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {header}

      <div className="py-10 max-w-2xl w-full mx-auto">
        <h1 className="text-4xl font-light text-white">
          {interviewTitle}
        </h1>
      </div>

      <div className="w-full pb-10">
        <div className="w-full max-w-2xl mx-auto">
          {/* <h3 className="mb-2 text-lg font-light text-center text-gray-400">A summary of your interview</h3> */}
          <div className="">
            {serverFeedback ? (

              <div className="text-sm text-gray-400 [&>ul>li]:list-disc [&>ul]:list-inside">
                <Markdown options={{ forceBlock: true }}>{serverFeedback}</Markdown>
              </div>

            ) : (
              <h1 className="text-gray-500 font-medium flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </h1>
            )}
          </div>
        </div>
      </div>

      <div className=" bg-gray-800">


        <div className="w-full max-w-2xl mx-auto mt-8 grid grid-cols-1">

          <h3 className="mb-2 text-xl font-light text-gray-500 text-center">Your interview transcript</h3>
          <div className="pt-10 pb-20">
          {items.map((item, index) => item.content && (
            (item.role === 'assistant') ? (

              <div key={index} className="py-4 px-2 text-left">
                <p className="text-gray-400 font-mono text-sm">
                  <strong>Interviewer: </strong>
                  <span>{item.content ? item.content : '(truncated)'}</span>
                </p>

              </div>
            ) : (
              <div className="py-4 px-2 text-left">
                <p className="text-white font-mono text-sm" >
                  <strong>You: </strong>
                  <span className="">{item.content ? item.content : '(truncated)'}</span>
                </p>
              </div>
            )
          ))}
          </div>

        </div>
      </div>

    </div>
  )
}; 
