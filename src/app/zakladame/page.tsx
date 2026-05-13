// Pre-landing — server component, jen rendruje klientskou plochu.

import PreLandingClient from './PreLandingClient';

export const dynamic = 'force-static';

export default function ZakladamePage() {
  return <PreLandingClient />;
}
