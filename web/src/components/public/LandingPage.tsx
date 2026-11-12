import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, CircleDollarSign, House, ReceiptText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brand } from './Brand'

const benefits = [
  {
    icon: House,
    title: 'One home, together',
    description: 'Keep the people and shared household expenses in one place.',
  },
  {
    icon: CircleDollarSign,
    title: 'A fair split, every time',
    description: 'Bills are divided evenly, with every cent accounted for.',
  },
  {
    icon: ReceiptText,
    title: 'Clear from bill to paid',
    description: 'See each person’s share and whether it has been paid.',
  },
]

export function LandingPage() {
  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <Brand />
        <nav className="marketing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#why-hearth">Why hearth</a>
        </nav>
        <div className="marketing-actions">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">
              Get started <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <section className="marketing-hero">
        <div className="hero-copy">
          <div className="marketing-eyebrow">
            <span /> SHARED HOME, CLEAR HEAD
          </div>
          <h1>
            Home is better
            <br />
            when it <em>adds up.</em>
          </h1>
          <p>
            Keep household bills simple. Bring your people together, split expenses fairly, and
            always know where things stand.
          </p>
          <div className="hero-actions">
            <Button asChild size="lg">
              <Link to="/signup">
                Create your home <ArrowRight />
              </Link>
            </Button>
            <span>No spreadsheets. No awkward reminders.</span>
          </div>
          <div className="hero-reassurance">
            <span className="reassurance-icon">
              <Check size={15} />
            </span>
            Built for the everyday costs of living together
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="art-house-card">
            <div className="art-card-top">
              <div className="art-home-icon">
                <House size={20} />
              </div>
              <span className="art-live-dot" />
            </div>
            <div className="art-line art-line-long" />
            <div className="art-line art-line-short" />
            <div className="art-divider" />
            <div className="art-row">
              <span className="art-row-icon">
                <Users size={15} />
              </span>
              <span className="art-row-line" />
              <span className="art-row-check">
                <Check size={12} />
              </span>
            </div>
            <div className="art-row">
              <span className="art-row-icon receipt">
                <ReceiptText size={15} />
              </span>
              <span className="art-row-line medium" />
              <span className="art-row-check">
                <Check size={12} />
              </span>
            </div>
            <div className="art-row">
              <span className="art-row-icon dollar">
                <CircleDollarSign size={15} />
              </span>
              <span className="art-row-line short" />
              <span className="art-row-check">
                <Check size={12} />
              </span>
            </div>
          </div>
          <div className="art-plant plant-left">
            <i />
            <b />
            <span />
          </div>
          <div className="art-plant plant-right">
            <i />
            <b />
            <span />
          </div>
          <div className="art-ground" />
        </div>
      </section>

      <section className="marketing-benefits" id="why-hearth">
        <div className="section-heading">
          <div className="marketing-eyebrow">
            <span /> THE HOUSEHOLD, IN SYNC
          </div>
          <h2>Less keeping score. More feeling at home.</h2>
          <p>Shared expenses should be clear, fair, and easy to take care of.</p>
        </div>
        <div className="benefit-grid">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <Card className="benefit-card" key={title}>
              <CardHeader>
                <span className={`benefit-icon benefit-icon-${index + 1}`}>
                  <Icon size={19} />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-copy">
          <div className="marketing-eyebrow">
            <span /> SIMPLE BY DESIGN
          </div>
          <h2>Three small steps. A smoother shared home.</h2>
          <p>
            Start with the people you live with. Hearth takes care of the math and keeps the details
            easy to find.
          </p>
          <Button asChild variant="outline">
            <Link to="/signup">
              Set up your household <ArrowRight />
            </Link>
          </Button>
        </div>
        <Card className="steps-card">
          <CardContent className="steps-list">
            <div className="step-item">
              <span className="step-index">01</span>
              <div>
                <b>Name your household</b>
                <small>Give your shared place a name.</small>
              </div>
              <House size={18} />
            </div>
            <div className="step-item">
              <span className="step-index">02</span>
              <div>
                <b>Add your people</b>
                <small>Everyone who shares expenses.</small>
              </div>
              <Users size={18} />
            </div>
            <div className="step-item">
              <span className="step-index">03</span>
              <div>
                <b>Take care of bills</b>
                <small>See every share, all in one place.</small>
              </div>
              <ReceiptText size={18} />
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="marketing-footer">
        <Brand />
        <span>Made for the place you share.</span>
        <Link to="/login">Already have an account?</Link>
      </footer>
    </main>
  )
}
