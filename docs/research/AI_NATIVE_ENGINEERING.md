# AI-native engineering: what the next stage is, and what T.O X should build

Date: 2026-11-23. Method: about 35 web searches, 3 pages opened in full, the rest read from search summaries. Where a claim rests on a summary only, the text says so. No number here is invented; where a source gave no number, none is given. The description of what T.O X already has comes from the task brief, not from reading the code.

---

## 1. Thesis

### The hypothesis under test

"Design as verified computation": the engineer states intent and constraints; model, drawings, quantities and schedule are derived artefacts; an LLM proposes and explains; every number comes from a deterministic engine with provenance; compliance and clash checks run on every change; changes are reviewed as diffs; the system learns from accepted and rejected proposals.

### Verdict

The core is supported. Three parts are overstated and two are missing.

**Supported by evidence**

- *LLM proposes, engine computes.* This is the one pattern that works repeatedly in the 2024 to 2026 literature. A structural-analysis study found the bare model "lacks reliable precision in its numerical results", while the same model wrapped as an agent that writes OpenSeesPy code passed its benchmark at over 99% ([arXiv 2507.02938](https://arxiv.org/pdf/2507.02938)). Text2BIM gets usable models only because a rule-based checker feeds errors back to the agents ([arXiv 2408.08054](https://arxiv.org/abs/2408.08054)). The constraint-solving community states the same rule: "let the LLM propose, let the solver check" ([Szeider, TU Wien](https://www.ac.tuwien.ac.at/files/szeider/neurosymbolic-ai.md)).
- *Checks on every change.* Proposed for IFC models in 2020 by Moult and Krijnen (behaviour-driven tests plus continuous integration, [TU Delft](https://repository.tudelft.nl/file/File_289d35c4-0580-49ba-a239-d5bc87722a91)) and now backed by a published standard for information requirements, IDS 1.0, June 2024 ([buildingSMART IDS](https://github.com/buildingSMART/IDS/blob/master/Documentation/developer-guide.md)).
- *Review as diffs.* Shipping in Speckle (version compare in viewer and SDK, [docs](https://docs.speckle.systems/3d-viewer/compare-versions)) and in Bonsai with Git and `ifcmerge` ([docs](https://docs.bonsaibim.org/guides/authoring/git_support.html)).

**Overstated**

1. *"Everything is derived from intent, like compiled output."* Not supported. Requirements under-determine a design. Twenty years of generative design show this: topology optimisation is rarely used on large projects because one "optimal" form seldom meets what architects and engineers both need ([Xie 2022](https://link.springer.com/10.1007/s44223-022-00003-y)), and LLM floor-plan generators still need a second model because LLMs handle exact numeric and geometric constraints poorly ([HouseTune, arXiv 2411.12279](https://arxiv.org/html/2411.12279v4)). Correction: the **source** is the parametric model plus a log of decisions and requirements. The **derived** artefacts are drawings, quantities, schedule, check reports. The model itself is co-authored, not compiled.
2. *"Code compliance runs like CI tests."* Only for the computable subset. Turning regulation text into rules is still the bottleneck: the EU ACCORD project produced a rule format and ontology but I found no independent accuracy figures ([CORDIS](https://cordis.europa.eu/project/id/101056973/results)); an LLM-to-LegalRuleML study reports no quantitative result in its abstract ([arXiv 2407.21060](https://arxiv.org/abs/2407.21060)); Singapore made CORENET X submission mandatory for large projects from October 2025, but its automated checker is described as introduced progressively ([BCA](https://www1.bca.gov.sg/regulatory-info/building-control/corenet-x/more-information/technological-enablers)). Correction: a green check means "these N encoded clauses pass", never "the design complies". Coverage must be shown beside every result.
3. *"The system learns from accepted and rejected proposals."* I found no AEC evidence for this. Data is scarce and often not licensed for training ([arXiv 2603.12605](https://arxiv.org/pdf/2603.12605)). Correction: store decisions as retrievable precedent with reasons. Do not claim learning until an evaluation set shows improvement.

**Missing**

4. *Verification is not validation.* A deterministic engine gives the right answer to the question asked. Wrong loads, wrong boundary conditions or a wrong code edition pass straight through. CAD benchmarks say the same about generated geometry: "successful execution does not guarantee geometric correctness" ([Text2CAD-Bench, arXiv 2605.18430](https://arxiv.org/abs/2605.18430)). Inputs and assumptions need provenance as much as outputs do.
5. *Human review is the binding constraint, not generation.* The NSPE Board of Ethical Review (Case 24-2, read in full) found sealing an AI-drafted report acceptable where the engineer verified it thoroughly, and sealing AI-assisted design documents unethical where the review was only high-level ([NSPE](https://www.nspe.org/career-growth/ethics/board-ethical-review-cases/use-artificial-intelligence-engineering-practice)). The product must make deep review cheap, or the engineer cannot lawfully use the output.

### The corrected thesis, stated precisely

The next stage is **engineering as an auditable change process**: the model and its requirement and decision log are the source, every other artefact is regenerated from it, and no number reaches a deliverable unless a versioned deterministic engine produced it from recorded inputs. An AI agent proposes changes as reviewable diffs; a declared, partial set of checks re-runs on each one; the engineer accepts or rejects with a reason and remains in responsible charge. The gain is not faster drawing. It is that review, traceability and re-checking become cheap enough to do on every change.

### On the owner's "bigger than paper to CAD" claim

Unproven, and history argues for caution. Both earlier transitions took roughly two decades and neither moved sector productivity (section 2). They automated representation and left decisions, contracts and liability where they were. AI will be the bigger jump only if it changes what gets checked and how accountability is evidenced. One more correction: "an agent drives the app through tools" is no longer new. Autodesk now ships an official Revit MCP server with read and write tools, usable from Claude Desktop ([Autodesk, June 2026](https://www.autodesk.com/blogs/aec/2026/06/17/revit-public-mcp-server/)). T.O X's edge has to be provenance and verification, which closed incumbent engines make hard.

---

## 2. Lessons from the two past transitions

| | Paper to CAD | 2D CAD to BIM | Lesson for AI |
|---|---|---|---|
| Period | US firms computerised from the early 1980s through the 1990s ([Canizares, IEEE Annals 2025](https://scholars.uky.edu/en/publications/cad-and-the-computerization-of-architectural-labor-2/)) | North America: 17% of firms in 2007, 49% in 2009, 71% in 2012 ([McGraw-Hill](https://prnewswire.com/news-releases/bim-adoption-expands-from-17-in-2007-to-over-70-in-2012-according-to-new-mcgraw-hill-construction-report-189185591.html)). UK: 13% in 2011, 73% in 2020, with a plateau around 2018 ([NBS 2020](https://www.designingbuildings.co.uk/wiki/NBS_National_BIM_Report_2020)) | Expect one to two decades for the majority, even with a working tool |
| What changed first | Early on, large firms bought systems and a few operators ran them while most architects still drew by hand ([ACSA 1998](https://www.acsa-arch.org/proceedings/International%20Proceedings/ACSA.Intl.1998/ACSA.Intl.1998.63.pdf)) | New coordination roles; contractors overtook architects in adoption by 2012 (same McGraw-Hill source) | The first users are specialists beside the engineer, not the engineer |
| Roles | Drafting work was absorbed by engineers and architects; BLS still attributes weak drafter demand to CAD and BIM ([BLS](https://www.bls.gov/ooh/architecture-and-engineering/drafters.htm)) | Routine 2D production shrank; coordination grew | AI will absorb production tasks; checking and judgement remain |
| What drove adoption | Hardware cost falling | Client and government mandates (UK Level 2 mandate, 2016, per NBS summaries) | Mandates and client demand move adoption more than features |
| Economics | No sector-level gain visible | Construction labour productivity grew about 1% a year over two decades ([McKinsey 2017](https://www.mckinsey.com/mgi/our-research/reinventing-construction-through-a-productivity-revolution)) and about 0.4% a year from 2000 to 2022 ([McKinsey follow-up](https://www.mckinsey.com/capabilities/operations/our-insights/delivering-on-construction-productivity-is-no-longer-optional)) | Better tools did not fix fragmented process and contracts. Do not promise productivity; promise fewer errors and faster review, then measure |

Caveats. I did not find a quantitative adoption curve for CAD in architecture or engineering firms; the dates above are from histories, not surveys. The 17% baseline conflicts with a 28% figure in another McGraw-Hill summary. The productivity figures cover the whole sector and do not isolate the effect of BIM.

---

## 3. Evidence review by topic

Labels: **Proven** = shipping or replicated. **Early** = works in papers, on small or self-built test sets. **Failed / weak** = tried, little uptake or no independent evidence.

### 3.1 LLM agents for BIM and CAD

- **Early.** Text2BIM: agents write code against a BIM tool's API (Vectorworks), with a rule checker in the loop; early design stage only ([arXiv 2408.08054](https://arxiv.org/abs/2408.08054)).
- **Early, measured.** Text-to-CAD through code (CadQuery). A self-check loop improved GPT-4's compile rate by 5.5% ([CADCodeVerify, arXiv 2410.05340](https://arxiv.org/html/2410.05340v2)); larger models write more executable code ([Text-to-CadQuery, arXiv 2505.06507](https://arxiv.org/html/2505.06507v1)). On Parametric CAD Bench v3 (100 tasks, 13 agent systems, abstract opened) the best system scored 61.03% mean reward overall and 84.66% on drawing-to-CAD ([arXiv 2611.02659](https://arxiv.org/abs/2611.02659)). Text2CAD-Bench reports widespread failures on sweep, loft and shell ([arXiv 2605.18430](https://arxiv.org/abs/2605.18430)). These are mechanical parts, not buildings.
- **Proven as plumbing.** Tool-calling over MCP: official Revit server, with write tools still labelled technical preview ([Autodesk help](https://help.autodesk.com/cloudhelp/ENU/ADSKMCP-RevitMcp/files/ADSKMCP_RevitMcp_revit_mcp_server_html.html)).
- **Early.** Question answering over IFC: 93.3% to 100% first-attempt accuracy on three models and 30 scenarios ([IfcLLM, arXiv 2605.13236](https://arxiv.org/html/2605.13236)); graph-RAG variants exist ([arXiv 2504.16813](https://www.arxiv.org/abs/2504.16813)). Test sets are small and not comparable.

### 3.2 Automated code compliance checking

- **Proven.** Checking *information* requirements: IDS 1.0 with open tooling (IfcTester, [PyPI](https://pypi.org/project/ifctester/0.0.240423)) and commercial support ([Solibri](https://www.solibri.com/news/everything-you-need-to-know-about-information-delivery-specifications)). Hand-written geometric rule checking of the Solibri kind has been in production for years.
- **Early.** Regulation text to rules: ACCORD's rule format, ontology and an 864-sentence dataset ([CORDIS](https://cordis.europa.eu/project/id/101056973/results)); LLMs that write Revit Python checks, with the authors flagging output accuracy as the risk ([arXiv 2506.20551](https://arxiv.org/abs/2506.20551v1)).
- **Weak.** No standard benchmark for translation accuracy across codes was found. Government checkers are arriving in phases, not complete.

### 3.3 Generative and constraint-based design

- **Proven but narrow.** Parametric and computational design as authored code or graphs: Hypar (C# functions that generate building systems, still active per [AEC Magazine](https://aecmag.com/ai/hypar-text-to-bim-and-beyond/)); Topologic for space topology ([topologicpy](https://pypi.org/project/topologicpy)).
- **Failed to spread.** Whole-building topology optimisation and "press a button" generative design ([Xie 2022](https://link.springer.com/10.1007/s44223-022-00003-y)).
- **Early.** Graph-conditioned floor-plan generators; a 2025 review says the best models still have non-negligible limits ([arXiv 2504.09694](https://arxiv.org/pdf/2504.09694)).

### 3.4 Knowledge graphs and digital twins

- **Weak.** A systematic review found more than half of digital-twin papers reused no existing ontology and that graphs mostly store metadata ([arXiv 2308.15168](https://arxiv.org/pdf/2308.15168)). A 2026 review reports applications stalling at the "digital shadow" stage ([ITcon 2026](https://itcon.org/papers/2026_43-ITcon-Elias.pdf), summary only). I found no quantified operational benefit.

### 3.5 Scan-to-BIM

- **Early.** Structural elements and room layouts are partly automated. MEP is the weak point: low automation, few component classes, accuracy below industrial need, according to one study ([HKUST](https://lbezone.hkust.edu.hk/rse/?p=60180), summary only). My coverage of 2024 to 2026 work here is thin.

### 3.6 AI in scheduling and estimating

- **Weak evidence.** Generative scheduling (ALICE) has vendor figures and one practitioner test where it came within about a week of a human CPM plan ([ENR](https://www.enr.com/articles/42520-software-assistant-optimizes-construction-scheduling-options)). No independent study found.
- **Early.** AI quantity take-off from drawings: on one live project, accuracy varied by finish type and the authors kept estimator oversight ([ASC 2026 paper](https://easychair.org/publications/paper/pkrRp), summary only).

### 3.7 Neuro-symbolic: LLM plus solver or verifier

- **Proven as a pattern, early in AEC.** LLM writes the formal model, solver runs it ([ConstraintLLM, arXiv 2510.05774](https://arxiv.org/html/2510.05774v1)); structural agents on OpenSeesPy ([arXiv 2507.02938](https://arxiv.org/pdf/2507.02938), [arXiv 2510.05414](https://arxiv.org/html/2510.05414v1)). A 2026 benchmark paper warns that many such results measure "does it run" and mix up benchmark design with agent ability ([OpenSeesAgentBench](https://icml.cc/virtual/2026/73566)). A second paper cautions that LLMs are also unreliable as *formalisers* ([arXiv 2505.13252](https://arxiv.org/pdf/2505.13252)): the solver checks the model the LLM wrote, not the problem the user meant.

### 3.8 Known limits

- **Arithmetic and reasoning.** Scores drop when only the numbers in a word problem change ([GSM-Symbolic, arXiv 2410.05229](https://arxiv.org/abs/2410.05229)).
- **Spatial reasoning.** A cross-benchmark study still finds a clear gap to humans on mental reconstruction and assembly ([arXiv 2508.13142](https://arxiv.org/pdf/2508.13142)); one later paper reports about 50% for a frontier model against about 79% for humans on SpatialViz ([arXiv 2603.26779](https://arxiv.org/pdf/2603.26779), figures as cited there).
- **Domain knowledge.** AEC exam-style scores fall as tasks move from recall to application ([AECBench, arXiv 2509.18776](https://arxiv.org/html/2509.18776v3)).
- **Liability.** The engineer in responsible charge must be engaged from conception to completion ([NSPE](https://www.nspe.org/nspe-advocacy/explore-issues/professional-policies-and-position-statements/responsible-charge)); ASCE Policy 573 keeps responsibility with the civil engineer ([ASCE](https://www.asce.org/advocacy/policy-statements/ps573---artificial-intelligence-and-engineering-responsibility)). Case 24-2 also found a confidentiality breach in uploading client data to a public AI tool, which supports T.O X's privacy mode.
- **Regulation.** The EU AI Act treats AI as high-risk when it is a safety component of a regulated product; the date for those products has moved to August 2028 ([EU AI Act Service Desk](https://ai-act-service-desk.ec.europa.eu/en/high-risk-ai-regulated-products)). Whether design software falls in scope I could not confirm.
- **Data and IP.** Public CAD datasets with design history are small and simple, about 170K to 178K models traced back to one proprietary repository ([DeepCAD, arXiv 2105.09492](https://arxiv.org/pdf/2105.09492); [arXiv 2603.12605](https://arxiv.org/pdf/2603.12605)). No comparable open BIM corpus was found.

### 3.9 Software-engineering ideas already in AEC

| Idea | AEC work | State |
|---|---|---|
| Version control, diff | Speckle versions and compare; Bonsai Git | Proven |
| Merge | `ifcmerge` three-way merge, refuses unsafe cases ([GitHub](https://github.com/brunopostle/ifcmerge)) | Early. A community critique calls it "git applied to SPF files", not semantic version control ([OSArch](https://community.osarch.org/discussion/comment/28995/)) |
| Tests and CI | Gherkin rules on IFC (Moult and Krijnen 2020); IfcTester; Speckle Automate results attached to versions ([docs](https://docs.speckle.systems/workspaces/versions)) | Early to proven |
| Types and schemas | IFC schema, IDS, bSDD | Proven for information, not for behaviour |
| Design as code | Hypar, CadQuery, Topologic | Proven in niches |
| Compilers, formal verification, package ecosystems | Nothing found beyond analogy | Not found |

---

## 4. Proposed architecture for T.O X

Seven layers. "Has" is taken from the brief.

| Layer | Purpose | T.O X has | Missing |
|---|---|---|---|
| 1. Intent and requirements | Structured, testable statements of what the design must satisfy | Parametric model inputs; QA and planning module | A requirements register: each item typed (information, numeric limit, relation), with an owner and a linked check. IDS export for the information part |
| 2. Knowledge and code rules | Rules as data, each tied to a clause and edition | ACI and Eurocode-style calculators, MEP sizing sheets, price and spec book | Rule packs separate from code, with clause citation, edition, scope note and pass and fail fixtures. A coverage statement per pack |
| 3. Deterministic engines | The only source of numbers | Member checks, MEP sizing, quantity take-off, critical path | Engine identity and version on every result; declared tolerance; stated validity range (for example span, material, load type) with refusal outside it |
| 4. Derived artefacts | Regenerated, never hand-edited | Drafting sheets, BOQ, IFC export, DXF, schedule | A dependency record: which model state and engine versions produced each artefact; a stale flag when the source changes |
| 5. Verification loop | Checks re-run on every change | Calculators and clash-type checks, run on demand (assumed) | An automatic runner after each change set; red and green with coverage; history of results per model version |
| 6. AI agent with provenance, diff and undo | Proposes; never computes | Tool-calling agent, voice and chat, any provider, MCP bridge, privacy mode | Proposals as dry-run change sets with a semantic diff; a rule that agent text may show only numbers returned by tools; accept or reject with reason; one-step undo of a whole change set |
| 7. Learning from use | Reuse of past decisions | Not stated | A decision log (proposal, diff, check results, verdict, reason) retrievable as precedent. No training claims until an evaluation set shows gain |

Two design rules cut across the layers.

- **Numbers have one origin.** Layer 6 never writes a number into layer 4. It calls layer 3 and passes a reference.
- **Every result carries its limits.** A check result is a tuple: value, engine and version, inputs, clause, coverage, validity range. The interface shows all of it on demand.

---

## 5. Accuracy and trust method

**Measuring correctness**

1. *Golden problems.* Per engine, a fixed set of problems with known answers from code commentaries, textbook worked examples and hand calculations. Record the source and page. Report the maximum relative error, not the average.
2. *Independent cross-checks.* Run the same case in a second, unrelated implementation: OpenSees for frames, IfcOpenShell and IfcTester for exported IFC, a commercial package when the owner has a licence. Disagreement above tolerance is a defect until explained.
3. *Error budgets.* State a tolerance per quantity type before measuring (for example member utilisation, pipe size, concrete volume, path duration). An engine that cannot meet its budget ships with a visible warning or not at all. The budgets are the owner's engineering decision; this document does not set them.
4. *Regression suite.* Every fixed bug adds a case. The suite runs before each release and on each rule-pack change.
5. *Agent evaluation.* A scripted task set scored on outcome (resulting geometry, quantities, check status), not on whether the tool calls ran. This is the exact failure the CAD and OpenSees benchmark papers warn about. Report per provider and model, with sample size.
6. *Mutation tests for rules.* Deliberately break a design and confirm the rule pack catches it. A rule that never fails is not evidence.
7. *Honest reporting.* Under about 30 cases, call a result an indication. List what was not tested.

**What stays with the licensed engineer**

- Choice of code, edition, load cases, design basis and assumptions.
- Judgement on anything outside an engine's stated validity range.
- Acceptance of every change set that affects safety, with a recorded reason.
- Interpretation of clauses the rule packs do not encode.
- Signature and seal. Following Case 24-2, the product should record evidence of detailed review, not a single approve click.
- The decision to send any project data to an external model.

---

## 6. Staged roadmap

Ordered by value over effort. Each step fits one work session.

| # | Step | Done when |
|---|---|---|
| 1 | Provenance record on every engine output (engine id, version, inputs, clause, timestamp) | Clicking any calculator result or BOQ line shows its full trace; a test confirms no output lacks one |
| 2 | Golden suite for one engine family (start with structural member checks) | At least 30 cited problems run in one command and print maximum relative error against a stated tolerance |
| 3 | Semantic model diff by stable element id | Two saved states produce a list of added, removed and changed elements with quantity and cost deltas; verified on 5 hand-made changes |
| 4 | Agent proposals as dry-run change sets | Every agent write goes through preview, accept or reject, and a single undo; a test shows the model is byte-identical after undo |
| 5 | Checks-on-change runner with coverage | After any accepted change set, registered checks re-run and show pass, fail and "not covered"; the run time on the sample project is displayed |
| 6 | Numeric firewall for agent text | On 20 scripted prompts, no number appears in an agent reply that did not come from a tool result in that turn |
| 7 | Requirements register with IDS export | Ten sample requirements export to an IDS file that passes the official XSD and runs in IfcTester against the T.O X IFC export |
| 8 | Rule packs as data | One existing calculator's rules moved to a data file with clause, edition, and one passing and one failing fixture each; mutation test catches all seeded faults |
| 9 | Cross-check harness | Ten frame or beam cases compared against OpenSees (or published results) with differences tabulated |
| 10 | Decision log and precedent retrieval | Accept and reject events stored with reason; the agent can cite a matching past decision by id |
| 11 | Agent evaluation set | 50 outcome-scored tasks run against two providers; scores and sample size reported |
| 12 | Review bundle export | One file containing the diff, check results, coverage, assumptions and unverified items for a chosen change range |

---

## 7. Novel directions worth trying

"Nobody has shipped" below means I found no example in this search, not that none exists.

**A. Replayable evidence bundle ("proof-carrying design").** Each deliverable ships with a machine-readable bundle: inputs, engine versions, rule coverage, hashes. A reviewer opens it in T.O X and re-runs every number offline. *Why not shipped:* incumbent engines are closed, licensed and change between releases, so results cannot be replayed by a third party. A single-file app that owns its engines can pin versions. *Risk:* false assurance. A bundle that replays proves consistency, not that the assumptions were right. Old engine versions must stay runnable.

**B. Robustness margins by fuzzing.** Borrow property-based testing: vary loads, dimensions and material values within stated tolerances and report where each check flips from pass to fail. The output is a margin map, not a single utilisation figure. *Why not shipped:* it needs fast regeneration and thousands of engine runs, which is costly in desktop solvers. Browser-side closed-form engines make it cheap. *Risk:* sampled ranges may be mistaken for a reliability analysis. It is not one; code safety factors already embed assumptions and this must not double count or replace them.

**C. One diff across four artefacts, with requirement "blame".** A change to one requirement or element shows, in one view, the effect on the model, quantities, cost and schedule, and each element can answer "which requirement, rule and accepted proposal put me here". Systems engineering tools do this for aircraft and cars; I found no small AEC tool that does. *Why not shipped:* model, estimate and schedule normally live in separate products from separate vendors. T.O X holds all of them in one file. *Risk:* the dependency graph is costly to keep correct; a wrong link is worse than no link.

---

## 8. Open questions and weak evidence

**Not verified**

- A quantitative CAD adoption curve for architecture and engineering firms. Dates in section 2 come from histories.
- The MacLeamy "effort moves earlier" claim for BIM. No evidence retrieved.
- Any causal link between BIM and productivity. The McKinsey figures are sector-wide.
- Result tables of Text2CAD-Bench, Text2BIM and the OpenSees benchmarks. Only abstracts or summaries were read. The SpatialViz figures are second-hand.
- Whether the CORENET X automated checker is fully live.
- Whether engineering design software falls under the EU AI Act high-risk rules.
- Independent evidence for AI scheduling and AI take-off accuracy. What exists is vendor data and single-project studies.
- Any study of learning from accepted and rejected design proposals in AEC.
- Whether Speckle Automate runs on every version by default.
- Scan-to-BIM progress in 2024 to 2026; my sources are mostly 2022 to 2023.
- T.O X's current state. All "has" entries rest on the brief.

**Open questions**

1. How much of a real code (for example ACI 318 member design) can be encoded with fixtures in a reasonable effort, and how should coverage be displayed so a user does not read green as "compliant"?
2. What review interface satisfies "responsible charge"? Case 24-2 says high-level review is not enough, but no standard defines enough.
3. Do semantic diffs stay readable on large models, or do they need grouping by requirement or system?
4. Can provenance survive export to IFC and DXF, or is it lost at the boundary?
5. Does retrieval of past decisions improve acceptance rates, or does it entrench the first user's habits? This needs the evaluation set from step 11.
6. Which jurisdictions, if any, will accept a replayable evidence bundle as part of a submission?
