import { SolitoImageProvider as SolitoImageProviderOG } from 'solito/image'

const imageURL = process.env.NEXT_PUBLIC_APP_URL as `http:${string}` | `https:${string}`
console.log(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL')
export const SolitoImageProvider = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode => {
  return (
    <SolitoImageProviderOG
      loader={({ quality, width, src }) => {
        return `${imageURL}${src}?w=${width}&q=${quality}`
      }}
    >
      {children}
    </SolitoImageProviderOG>
  )
}
