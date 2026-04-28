import { MapPin, Star, Coffee, ShoppingBag, Shirt } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Course } from '@/data/mock'

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="overflow-hidden card-hover border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="relative h-48 overflow-hidden group">
        <img
          src={course.image}
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-foreground font-bold">
            {course.difficulty}
          </Badge>
          <Badge className="bg-primary text-primary-foreground font-bold">{course.price}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold font-montserrat leading-tight">{course.name}</h3>
          <div className="flex items-center gap-1 text-accent font-semibold">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">{course.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          {course.region} Region • {course.holes} Holes
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 text-muted-foreground mt-2">
          {course.amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-1 text-xs" title={amenity}>
              {amenity === 'Rentals' && <Shirt className="w-4 h-4" />}
              {amenity === 'Restaurant' && <Coffee className="w-4 h-4" />}
              {amenity === 'Pro-shop' && <ShoppingBag className="w-4 h-4" />}
              <span className="sr-only">{amenity}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full rounded-full font-bold uppercase tracking-wider">
          Book Tee Time
        </Button>
      </CardFooter>
    </Card>
  )
}
