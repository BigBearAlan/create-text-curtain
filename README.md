# Text Curtain

A dependency-free text field whose vertical character columns behave like wind-disturbed strands of a beaded curtain. The repository also contains a shareable Codex skill that can recreate or integrate the effect in other web projects.

## Install the Codex skill

Paste this one-line instruction in your Codex to install and use the skill:

> Install and use the Codex skill from `https://github.com/BigBearAlan/create-text-curtain/tree/main/skills/create-text-curtain` to add a gentle wind-swept beaded text curtain to my project. Follow its `SKILL.md` immediately after installation.


After installation, you can ask:

> Use `$create-text-curtain` to add a gentle, wind-swept beaded text curtain to this project.

## Run

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173` and brush the pointer through the text. Nearby characters receive an impulse; the disturbance travels up and down each independent strand, which keeps swinging after the pointer passes.

## Demo implementation

- Canvas-rendered character grid
- Independent vertical character strands with pinned tops
- Pointer collisions, propagated impulses, tension, damping, and pendulum-like settling
- Responsive density and reduced-motion support

## Skill contents

The installable skill is located at `skills/create-text-curtain/`. It includes:

- Trigger and integration instructions in `SKILL.md`
- Codex UI metadata in `agents/openai.yaml`
- A ready-to-copy standalone implementation in `assets/vanilla-template/`
