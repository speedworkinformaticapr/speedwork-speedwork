import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, MessageCircle, LogIn } from 'lucide-react'
import { MaintenanceConfig } from '@/services/maintenance'
import { useSystemData } from '@/hooks/use-system-data'

interface MaintenancePageProps {
  config: MaintenanceConfig
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

  const bgImage = config.bg_image_url || systemData?.bg_image_url
  const isVideo = bgImage?.match(/\.(mp4|webm|ogg)(\?.*)?$/i)
  const bgOpacity =
    config.bg_opacity !== undefined
      ? config.bg_opacity / 100
      : systemData?.bg_opacity !== undefined
        ? systemData.bg_opacity / 100
        : 0.2

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fade-in"
      style={{
        backgroundColor: config.bg_color,
        color: config.text_color,
        fontFamily: config.font_family,
      }}
    >
      {bgImage && !isVideo && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})`, opacity: bgOpacity }}
        />
      )}

      {bgImage && isVideo && (
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover"
          style={{ opacity: bgOpacity }}
          src={bgImage}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      <Link
        to="/login"
        className="absolute top-6 right-6 z-50 p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
        aria-label="Acesso Administrativo"
      >
        <LogIn className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
      </Link>

      <div className="z-10 w-full max-w-2xl text-center space-y-8 p-8 bg-background/80 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50">
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

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{config.title}</h1>

        <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-lg mx-auto">
          {config.message}
        </p>

        {timeLeft && (
          <div className="flex justify-center gap-4 py-6">
            {[
              { label: 'Dias', value: timeLeft.days },
              { label: 'Horas', value: timeLeft.hours },
              { label: 'Minutos', value: timeLeft.minutes },
              { label: 'Segundos', value: timeLeft.seconds },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center p-3 bg-primary/10 rounded-lg min-w-[80px]"
              >
                <span className="text-3xl font-bold text-primary">{item.value}</span>
                <span className="text-xs uppercase tracking-wider opacity-75">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-6 pt-4 border-t border-border/50">
          {config.whatsapp_url && (
            <a
              href={config.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
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
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
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
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
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
