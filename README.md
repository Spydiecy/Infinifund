# Infinifund

**Infinifund** is a decentralized crowdfunding platform for urban public goods, built on Base Sepolia (ETH). It enables communities to propose, fund, and transparently manage city projects through milestone-based funding and community-driven governance.

## Project Vision

Infinifund bridges the gap between urban development and blockchain by empowering citizens, investors, and project creators to collaborate with trust and transparency. The platform ensures accountability, protects investors, and fosters collective decision-making for better cities.

## Core Features

- **Citizenship Management:**  
  Admins verify and manage citizens. Only citizens can submit projects and vote in screening rounds.

- **Project Lifecycle:**  
  Projects go through a screening round (citizen voting), then a funding round (open to all). Only approved projects are eligible for funding.

- **Milestone-Based Funding:**  
  Funds are released in stages as project creators submit milestone reports. Investors vote to approve milestone completion before funds are unlocked.

- **Investor Protection:**  
  Investors can request a bailout if fraud is suspected. If the majority agrees, remaining funds are refunded.

- **Investor Leaderboards:**  
  Showcases top investors by participation and contribution to the platform.

- **User Profiles:**  
  Users can customize profiles with avatars (IPFS), social links, and view their created and funded projects.

## Platform Workflows

### 1. User Onboarding & Citizenship Workflow

```mermaid
flowchart TD
    A[User Connects Wallet] --> B{Already a Citizen?}
    B -->|Yes| C[Access Full Platform]
    B -->|No| D[Request Citizenship]
    D --> E[Admin Reviews Request]
    E --> F{Admin Decision}
    F -->|Approve| G[Citizenship Granted]
    F -->|Reject| H[Request Denied]
    G --> C
    H --> I[User Can Re-apply Later]
    
    style A fill:#e1f5fe
    style C fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#ffebee
```

### 2. Project Creation & Screening Workflow

```mermaid
flowchart TD
    A[Citizen Creates Project] --> B[Upload Project Details]
    B --> C[Add Icon & Banner Images]
    C --> D[Define Milestones]
    D --> E[Submit Project]
    E --> F[Project Enters Screening]
    F --> G[Citizens Vote on Project]
    G --> H{Voting Result}
    H -->|Approved| I[Admin Finalizes Screening]
    H -->|Rejected| J[Project Rejected]
    I --> K[Project Approved for Funding]
    J --> L[Creator Can Revise & Resubmit]
    
    style A fill:#e1f5fe
    style K fill:#e8f5e8
    style J fill:#ffebee
```

### 3. Investment & Funding Workflow

```mermaid
flowchart TD
    A[Approved Project Listed] --> B[Investors Browse Projects]
    B --> C[Investor Selects Project]
    C --> D[Enter Investment Amount]
    D --> E[Submit ETH Transaction]
    E --> F{Transaction Success?}
    F -->|Yes| G[Investment Recorded]
    F -->|No| H[Transaction Failed]
    G --> I[Funds Held in Contract]
    H --> J[User Can Retry]
    I --> K[Project Receives Funding]
    
    style A fill:#e1f5fe
    style G fill:#e8f5e8
    style K fill:#e8f5e8
    style H fill:#ffebee
```

### 4. Milestone Completion & Fund Release Workflow

```mermaid
flowchart TD
    A[Project Creator Completes Milestone] --> B[Submit Milestone Report]
    B --> C[Upload Evidence/Documentation]
    C --> D[Investors Review Submission]
    D --> E[Investors Vote on Completion]
    E --> F{Majority Approval?}
    F -->|Yes| G[Milestone Approved]
    F -->|No| H[Milestone Rejected]
    G --> I[Funds Released to Creator]
    H --> J[Creator Must Revise/Resubmit]
    I --> K{More Milestones?}
    K -->|Yes| L[Next Milestone Phase]
    K -->|No| M[Project Completed]
    L --> A
    
    style A fill:#e1f5fe
    style G fill:#e8f5e8
    style I fill:#e8f5e8
    style M fill:#e8f5e8
    style H fill:#ffebee
```

### 5. Investor Bailout & Protection Workflow

```mermaid
flowchart TD
    A[Investor Suspects Issues] --> B[Request Bailout]
    B --> C[Other Investors Notified]
    C --> D[Investors Vote on Bailout]
    D --> E{Majority Supports Bailout?}
    E -->|Yes| F[Bailout Approved]
    E -->|No| G[Bailout Rejected]
    F --> H[Remaining Funds Calculated]
    H --> I[Proportional Refunds Issued]
    G --> J[Project Continues Normally]
    I --> K[Project Terminated]
    
    style A fill:#fff3e0
    style F fill:#e8f5e8
    style I fill:#e8f5e8
    style G fill:#ffebee
    style K fill:#ffebee
```

### 6. Admin Management Workflow

```mermaid
flowchart TD
    A[Admin Dashboard Access] --> B{Admin Action Type}
    B -->|Citizenship| C[Manage Citizenship Requests]
    B -->|Projects| D[Finalize Project Screening]
    B -->|Admins| E[Add/Remove Administrators]
    B -->|Overview| F[View System Statistics]
    
    C --> G[Approve/Revoke Citizenship]
    D --> H[Approve Projects for Funding]
    E --> I[Update Admin Privileges]
    F --> J[Monitor Platform Health]
    
    G --> K[Update User Status]
    H --> L[Enable Project Funding]
    I --> M[Admin Permissions Updated]
    J --> N[Generate Reports]
    
    style A fill:#e1f5fe
    style K fill:#e8f5e8
    style L fill:#e8f5e8
    style M fill:#e8f5e8
```

## Technical Architecture

### Smart Contract Structure

```mermaid
graph TD
    A[Infinifund Contract] --> B[Citizenship Management]
    A --> C[Project Management]
    A --> D[Funding System]
    A --> E[Milestone Tracking]
    A --> F[Voting Mechanisms]
    
    B --> B1[Admin Functions]
    B --> B2[Citizen Verification]
    
    C --> C1[Project Creation]
    C --> C2[Screening Process]
    C --> C3[Approval System]
    
    D --> D1[Investment Tracking]
    D --> D2[Fund Distribution]
    D --> D3[Bailout System]
    
    E --> E1[Progress Reporting]
    E --> E2[Milestone Validation]
    E --> E3[Fund Release]
    
    F --> F1[Screening Votes]
    F --> F2[Milestone Votes]
    F --> F3[Bailout Votes]
```

## Technology Stack

- **Blockchain:** Base Sepolia Testnet (ETH)
- **Smart Contracts:** Solidity
- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Web3 Integration:** Wagmi, RainbowKit, Viem
- **Storage:** IPFS (Pinata) for images and files
- **UI Components:** Radix UI, Lucide Icons
- **Notifications:** Sonner Toast

## Contract Address

**Base Sepolia:** `0xCa36dD890F987EDcE1D6D7C74Fb9df627c216BF6`

## Key Features Implementation

### 🏛️ Citizenship System
- Manual admin approval for new citizens
- Role-based access control
- Citizen-only project creation and voting

### 📊 Project Lifecycle
1. **Pre-listing Phase:** Citizen voting on project proposals
2. **Approved for Funding:** Public investment opportunities
3. **Milestone-Based:** Progressive fund release

### 💰 Investment Protection
- Transparent fund tracking
- Majority-based milestone approval
- Emergency bailout mechanisms

### 🏆 Investor Recognition
- Real-time leaderboards
- Investment tracking
- Community recognition system

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/infinifund
   cd infinifund
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys and contract addresses
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## Contributing

We welcome contributions to improve Infinifund! Please read our contributing guidelines and submit pull requests for any enhancements.

## License

This project is licensed under the MIT License.

---

**Infinifund: Transparent, Community-Driven Urban Crowdfunding on Base.**
