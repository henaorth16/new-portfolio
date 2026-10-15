import { Underline } from './Chalk'

export interface LoaderProps {
  fadingOut?: boolean
}

export default function Loader({ fadingOut = false }: LoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-base transition-opacity duration-300 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center">
        {/* Animated chalk circles */}
        <div className="relative w-24 h-24 mb-6">
          <svg
            className="w-full h-full text-chalk chalk-art animate-[spin_3s_linear_infinite]"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="80 170"
            />
          </svg>
          <svg
            className="absolute inset-0 w-full h-full text-yellow chalk-art animate-[spin_2s_linear_infinite_reverse]"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="50 140"
              opacity="0.85"
            />
          </svg>
          {/* Subtle pulsating chalk speck */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-chalk rounded-full animate-ping opacity-60" />
          </div>
        </div>

        <div className="relative text-center">
          <p className="font-hand text-3xl md:text-4xl text-chalk chalky tracking-wide">
            Drawing the board...
          </p>
          <Underline variant={1} className="always mt-2" />
        </div>
      </div>
    </div>
  )
}
