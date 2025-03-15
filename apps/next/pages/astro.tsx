import { AstroScreen } from 'app/features/astro'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Astrocartography</title>
      </Head>
      <AstroScreen />
    </>
  )
}
