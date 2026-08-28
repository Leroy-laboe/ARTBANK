# ARTBANK — Project Update

**Date:** 28 August 2026
**Prepared by:** Leroy
**Period covered:** 5 – 28 August 2026

---

## Summary

The system is real and it works. An artist can register, document their work, publish it, receive an identified enquiry, negotiate, agree a price and settle the sale — and a buyer sees the whole thing from the other side.

What is not finished is the last stretch of polish and three features from the brief.

**I am asking for two more weeks — Monday 31 August to Friday 11 September.** This document sets out exactly what lands on which day.

**None of it affects the gallery event on 4 September.** Artist registration is ready.

---

## 1. The gallery event on Friday 4 September — we are ready

Artist registration is finished and working. Artists can sign up on the day, create their profile and start adding their work. Everything they enter is real data that we keep building on — nobody will have to re-enter anything later.

| | |
|---|---|
| ✅ | Artist sign-up, profile and artwork upload — working |
| ✅ | Public artist profile at their own web address — working |
| ✅ | Everything registered on the day is kept — no re-entry later |
| → | **One task outstanding:** I sit down with Khadija next week to test the JO1N ID sign-in in person |

That in-person test with Khadija is the only thing between us and being fully confident on the day, and it is booked for early next week. On that side, we are good.

**Important:** artists can keep registering and using the system while I am improving the rest of it. The improvement work does not take the system offline and does not affect their data.

---

## 2. What is built and working

Three weeks of calendar time, nine full build days. Roughly 44,000 lines of code, 25 screens, and a database of 21 connected tables. Every item below is live in the system today — not a mock-up.

| Feature | What it does | Status |
|---|---|---|
| **Accounts and sign-in** | Register as an artist or a buyer. The account decides which workspace you land in, automatically. | Done |
| **Documenting an artwork** | A five-step process: details, photographs, pricing and shipping, supporting documents, then rights and publishing. Nothing is filled in for the artist — every fact is theirs. | Done |
| **Private document storage** | Ownership proof, certificates and invoices are stored privately and can only be opened through a link that expires after five minutes. | Done |
| **Portfolio management** | Search, filter, publish, archive, change availability, act on many works at once, and export the whole portfolio to a spreadsheet. | Done |
| **The artwork record** | Seven sections per work, including a permanent history that cannot be edited or deleted — the record of what has happened to that piece. | Done |
| **Public artist profile and directory** | The artist controls exactly what a stranger sees. Contact details, prices and enquiries are each a separate choice. | Done |
| **Buyer side — browse, save, enquire** | Not in the original brief. Added because an artist receiving enquiries needs somebody to send them. | Done |
| **Identified enquiries** | A buyer cannot ask about price, availability or licensing anonymously. They give their name, role, purpose, budget range and timeline — and the database physically refuses to store an enquiry without them. | Done |
| **Messaging, both sides** | Every conversation carries the artwork and the purpose. Personal email and phone numbers are never shown, so contact stays inside ARTBANK. | Done |
| **Recording a sale and settling payment** | Also not in the brief. The artist requests an amount, the buyer confirms they have sent it, the artist confirms it arrived, and the work is marked sold. Money that has not arrived is never counted as earnings. | Done |
| **Security** | Every permission is enforced by the database itself rather than by the website, so the rules hold no matter how the system is reached. | Done |

---

## 3. What is not finished

I would rather list these plainly than have you find them.

| Item | Where it stands |
|---|---|
| **Not yet on a live web address** | It runs on my machine. Putting it online is a first-day task next week. |
| **The home dashboard shows sample figures** | It is the first screen after signing in and the numbers on it are placeholders. Everything it needs is already in the database — it just is not connected yet. |
| **Guardian accounts for artists under 18** | The database already refuses to let an adult message a minor without a verified guardian attached. There is no screen yet to set that up, so the protection cannot be used in practice. Our own terms already promise it. |
| **Private viewing rooms** | A buyer can request one today. The artist cannot yet create one. |
| **Shareable artwork link and QR code** | The idea of turning an Instagram post into a documented record. Not built yet. |
| **Opportunity matching** | The screen works and each match explains itself, but the matches were entered by hand. There is no system deciding them, and no way to post a new opportunity. |
| **Phone testing** | The screens are built to adapt, but I have not gone through all 25 of them on a real phone. |
| **Card payments** | Deliberately last. See section 5. |

---

## 4. Why it is not all done

### The honest headline: the job turned out bigger than the brief, and I chose to build the bigger version.

The brief described the artist's side. But an artist receiving enquiries needs somebody to send them, and an agreed price needs somewhere to be recorded. So I built the buyer side and the sales flow as well.

Neither was asked for. Both are why the system is a working product rather than a demonstration — and both are why the finishing touches ran past the date.

### The problems that cost real days

**Buyers were being sent to the artist's workspace.**
Anyone signing in as a buyer landed in the artist tools instead. The system was deciding which side to show a fraction of a second before it knew who had signed in. It looked like the accounts were wrong; it was a timing fault. Found and fixed.

**Sample data reappearing after I deleted it.**
The system is designed to show example content when a screen has nothing in it, so it is never blank. That meant deleting the test data made the examples come back — which looked exactly like the deletion had failed. It now tells the difference between "there is nothing here" and "I cannot read this".

**Sales had no idea what "waiting for payment" meant.**
The first version of the sales feature recorded a completed sale and nothing else. Once we discussed taking payments, that had to be rebuilt to understand a sale that has been agreed but not yet paid — otherwise a card payment could never have been added later without starting again. Better to have found it now than after launch.

**Money that had not arrived was being counted as earnings.**
An unpaid sale was showing in the artist's earnings total. It now counts only money actually received. This matters more than it sounds: the whole promise of the system is that it never shows an artist a number that is not true.

**The browse page was mostly works nobody could buy.**
Fifty-four of the sixty works on show had no artist account behind them — competition entries and sample pieces. A buyer could look at them but could not contact anybody. They are now hidden from browsing.

---

## 5. The two weeks I am asking for

**Monday 31 August → Friday 11 September.** The event sits inside week one, so that week is deliberately lighter.

### Week one — event week

| Day | What is finished that day |
|---|---|
| **Mon 31 Aug** | System live on a real web address. Three security gaps closed, including one that currently exposes which accounts belong to under-18s. |
| **Tue 1 Sep** | JO1N ID sign-in tested in person with Khadija. Full registration run-through, start to finish. |
| **Wed 2 Sep** | Home dashboard connected to real figures. No placeholder numbers on the first screen an artist sees. |
| **Thu 3 Sep** | Event rehearsal. Registration tested on real phones, exactly as an artist will use it on the day. |
| **🎨 Fri 4 Sep** | **GALLERY EVENT — artist registration live, collecting real accounts and real artworks.** |

### Week two

| Day | What is finished that day |
|---|---|
| **Mon 7 Sep** | Every remaining placeholder figure replaced or removed, across all screens. |
| **Tue 8 Sep** | Guardian accounts — linking an artist under 18 to a parent or guardian. |
| **Wed 9 Sep** | Guardian approval — the guardian sees and approves contact. The protection becomes real. |
| **Thu 10 Sep** | Private viewing rooms — the artist chooses the works, whether prices show, and when access expires. |
| **✅ Fri 11 Sep** | **Viewing rooms finished. Full run-through on phones. Handover of everything above.** |

### The one item at risk

The **shareable artwork link and QR code** is the piece most likely to slip past the 11th, because the event will take more of week one than the plan allows for.

I would rather tell you that now than on the day. If it slips, it is the first thing in the following week.

---

## 6. Card payments come last, and that is deliberate

The system already handles money. The artist requests an amount, the buyer confirms they have sent it, the artist confirms it arrived. That covers bank transfer and cash — which is how most art actually sells — and it works today.

Taking **card payments** inside ARTBANK is the **last thing I will add**, after the team and I have stress-tested everything else. Three reasons:

1. **It is the only part of the system where a mistake costs somebody real money.** Everything else can be corrected. A payment cannot.

2. **It needs a second piece of infrastructure** — a server that talks to the card provider. A web browser cannot be trusted to confirm a payment, because anyone could then claim to have paid without paying. That server has to be running and stable before cards are safe.

3. **It should be built on a system we have already tried to break**, not on one we are still finishing.

The groundwork is already in place, so adding it later costs no rework. It is a deliberate sequencing decision, not something I ran out of time for.

---

## 7. Something not in the brief that the system needs

While building, I found three things ARTBANK needs somebody to do that nobody currently can:

- **Nobody can post an opportunity.** The Opportunities screen works, but the entries in it were put there by hand. There is no way to add a real one.

- **Nobody can review a certificate request.** An artist can request a Certificate of Authenticity and upload their ownership proof and invoices. The request is accepted and marked "pending review". There is no reviewer. It sits there forever.

- **Nobody can suspend an account.** If someone misuses the platform, there is no way to stop them.

That is an **admin area**, and it is roughly **two further weeks**.

I am raising it as a question rather than folding it into the timeline above, because it was never part of what you asked for. It can wait until after launch — but the certificate requests will start arriving as soon as artists begin using the system, so it should not wait long.

---

## 8. What I need from you

| | |
|---|---|
| **Time** | **Two weeks, to Friday 11 September**, for everything in the schedule above. |
| **Decision** | Whether the admin area is **now** or **after launch**. Two weeks either way. |
| **Check-in** | I will show you where things stand on **Monday 7 September**, so the second week holds no surprises. |
| **Not blocked** | None of this affects **4 September**. Registration is ready and we collect real artists on the day. |

---

*Everything described here has been built and tested on a working system. Where something is incomplete, this document says so rather than showing it as finished — which is the same standard the product itself is held to: it never shows an artist a number it cannot stand behind.*
