import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, MessageCircle, LogIn } from 'lucide-react'
import { MaintenanceConfig } from '@/services/maintenance'
import { useSystemData } from '@/hooks/use-system-data'

interface MaintenancePageProps {
  config: MaintenanceConfig & {
    bg_opacity?: number
    bg_video_url?: string
  }
}

export default function MaintenancePage({ config }: MaintenancePageProps) {
  const { data: systemData } = useSystemData()
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    if (!config.return_date) return

    const targetDate = new Date(config.return_date).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [config.return_date])

  const bgVideo = config.bg_video_url
  const bgImage = config.bg_image_url || systemData?.bg_image_url
  const bgOpacity = config.bg_opacity !== undefined ? config.bg_opacity / 100 : 1

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fade-in dark:!text-slate-50"
      style={{
        color: config.text_color,
        fontFamily: config.font_family,
      }}
    >
      {bgVideo ? (
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover"
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : bgImage ? (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : null}

      <div
        className="absolute inset-0 z-10 dark:!bg-slate-950"
        style={{
          backgroundColor: config.bg_color,
          opacity: bgOpacity,
        }}
      />

      <Link
        to="/login"
        className="absolute top-6 right-6 z-50 p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
        aria-label="Acesso Administrativo"
      >
        <LogIn className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity dark:text-slate-200" />
      </Link>

      <div className="z-20 w-full max-w-2xl text-center space-y-8 p-8 bg-background/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          {systemData?.logo_url ? (
            <img
              src={systemData.logo_url}
              alt="Logo"
              className="h-28 w-auto object-contain animate-float drop-shadow-xl"
            />
          ) : (
            <img
              src="https://img.usecurling.com/i?q=golf&color=green&shape=fill"
              alt="Logo Alternativo"
              className="h-24 w-24 rounded-full object-cover border-4 border-primary shadow-lg animate-float"
            />
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-slate-50">
          {config.title}
        </h1>

        <div
          className="text-lg md:text-xl opacity-90 leading-relaxed max-w-lg mx-auto dark:text-slate-200 [&>p]:mb-4 last:[&>p]:mb-0 [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl"
          dangerouslySetInnerHTML={{ __html: config.message || '' }}
        />

        {config.return_date && (
          <div className="py-6">
            {timeLeft &&
            (timeLeft.days > 0 ||
              timeLeft.hours > 0 ||
              timeLeft.minutes > 0 ||
              timeLeft.seconds > 0) ? (
              <div className="flex justify-center gap-4">
                {[
                  { label: 'Dias', value: timeLeft.days },
                  { label: 'Horas', value: timeLeft.hours },
                  { label: 'Minutos', value: timeLeft.minutes },
                  { label: 'Segundos', value: timeLeft.seconds },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center p-3 bg-primary/10 dark:bg-slate-800/80 rounded-lg min-w-[80px] dark:border dark:border-slate-700"
                  >
                    <span className="text-3xl font-bold text-primary dark:text-slate-50">
                      {item.value}
                    </span>
                    <span className="text-xs uppercase tracking-wider opacity-75 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-2xl font-semibold text-primary dark:text-slate-50 animate-pulse">
                Retornaremos em breve!
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-6 pt-4 border-t border-border/50 dark:border-slate-800">
          {config.whatsapp_url && (
            <a
              href={config.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200 dark:text-slate-300 dark:hover:text-white"
            >
              <MessageCircle className="w-8 h-8" />
              <span className="sr-only">WhatsApp</span>
            </a>
          )}
          {config.instagram_url && (
            <a
              href={config.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200 dark:text-slate-300 dark:hover:text-white"
            >
              <Instagram className="w-8 h-8" />
              <span className="sr-only">Instagram</span>
            </a>
          )}
          {config.facebook_url && (
            <a
              href={config.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200 dark:text-slate-300 dark:hover:text-white"
            >
              <Facebook className="w-8 h-8" />
              <span className="sr-only">Facebook</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
