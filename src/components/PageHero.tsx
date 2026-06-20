import React from 'react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbProp {
  label: string
  href?: string
}

interface PageHeroProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbProp[]
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function PageHero({ title, description, breadcrumbs = [], icon, children }: PageHeroProps) {
  return (
    <div className="bg-[#0052CC] pt-24 pb-20 text-white relative overflow-hidden">
      {icon && (
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          {icon}
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10">
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-white/70">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href} className="hover:text-white transition-colors">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-white font-medium">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-white/50" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <h1
          className="text-4xl md:text-6xl font-montserrat font-black mb-4 uppercase leading-tight animate-fade-in-up"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {description && (
          <div
            className="text-xl font-medium max-w-2xl opacity-90 mb-8 animate-fade-in-up [&_p]:mb-2 [&_p:last-child]:mb-0"
            style={{ animationDelay: '100ms' }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {children && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
