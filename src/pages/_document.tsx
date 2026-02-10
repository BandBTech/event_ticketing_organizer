import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Timro-Ticket - Event Ticketing Platform" />
      </Head>
      <body className="antialiased items-stretch">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
