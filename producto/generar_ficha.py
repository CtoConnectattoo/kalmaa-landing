#!/usr/bin/env python3
"""Valida producto/funcionalidades.yaml y genera la ficha Markdown para la KB.

Uso:
  python3 producto/generar_ficha.py                 # valida e imprime la ficha
  python3 producto/generar_ficha.py -o RUTA.md      # valida y escribe la ficha
  python3 producto/generar_ficha.py --check         # solo valida (sale con error si algo falla)

Requiere PyYAML (pip install pyyaml).
"""
import argparse
import sys
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "producto" / "funcionalidades.yaml"
CAMPOS = ["id", "nombre", "que_hace", "estado", "fase", "planes", "limites", "desde", "pasos", "no_hace", "claims", "capturas"]


def validar(c):
    errores = []
    estados, tipos = set(c["estados"]), set(c["tipos_captura"])
    ids = set()
    for f in c["funcionalidades"]:
        fid = f.get("id", "?")
        for campo in CAMPOS:
            if campo not in f:
                errores.append(f"{fid}: falta el campo «{campo}»")
        if fid in ids:
            errores.append(f"{fid}: id repetido")
        ids.add(fid)
        if f.get("estado") not in estados:
            errores.append(f"{fid}: estado «{f.get('estado')}» no válido ({', '.join(sorted(estados))})")
        if f.get("estado") == "activa" and not f.get("desde"):
            errores.append(f"{fid}: una funcionalidad activa necesita fecha «desde»")
        for p in f.get("planes") or []:
            if p not in c["planes"]:
                errores.append(f"{fid}: plan «{p}» no existe en «planes»")
        for cap in f.get("capturas") or []:
            if cap.get("tipo") not in tipos:
                errores.append(f"{fid}: captura {cap.get('archivo')} con tipo «{cap.get('tipo')}» no válido")
            if cap.get("tipo") == "real" and f.get("estado") != "activa" and f.get("estado") != "beta":
                errores.append(f"{fid}: captura «real» en una funcionalidad que no está activa ni en beta")
            if not (RAIZ / cap.get("archivo", "")).exists():
                errores.append(f"{fid}: no existe {cap.get('archivo')}")
    for n in c.get("no_hace", []):
        if n.get("estado") not in c["estados_no_hace"]:
            errores.append(f"no_hace/{n.get('id')}: estado «{n.get('estado')}» no válido")
    return errores


def celda(x):
    return str(x).replace("|", "\\|").replace("\n", " ")


def ficha(c):
    fs = c["funcionalidades"]
    L = [
        "# Funcionalidades · Kalmaa",
        "",
        "> **Archivo generado, no editar a mano.** Fuente: `kalmaa-landing/producto/funcionalidades.yaml` "
        "(https://github.com/CtoConnectattoo/kalmaa-landing/blob/main/producto/funcionalidades.yaml). "
        "Se regenera con `python3 producto/generar_ficha.py -o <KB>/kalmaa/producto/funcionalidades.md`.",
        "",
        f"Actualizado: {c['actualizado']}. {c['estado_producto'].strip()}",
        "",
        "Regla: lo que no está aquí como `activa` no se presenta como disponible (web, anuncios, directorios, agente SEO/GEO).",
        "",
        "## Resumen",
        "",
        "| id | Funcionalidad | Estado | Fase | Planes | Capturas |",
        "|---|---|---|---|---|---|",
    ]
    for f in fs:
        caps = f.get("capturas") or []
        tipos = ", ".join(sorted({cap["tipo"] for cap in caps}))
        txt_caps = f"{len(caps)} ({tipos})" if caps else "—"
        L.append(
            f"| `{f['id']}` | {celda(f['nombre'])} | {f['estado']} | {f['fase']} | "
            f"{', '.join(f['planes'])} | {txt_caps} |"
        )

    L += ["", "## Planes", ""]
    for k, v in c["planes"].items():
        if isinstance(v, dict):
            L.append(f"- **{k}**: {v.get('precio', '')}. {v.get('incluye', '')}")
        else:
            L.append(f"- **{k}**: {v}")

    L += ["", "## Reglas de Instagram (aplican a todo)", ""]
    L += [f"- {r}" for r in c["reglas_instagram"]]

    L += ["", "## Detalle", ""]
    for f in fs:
        L += [f"### {f['nombre']} (`{f['id']}`)", "", f"{f['que_hace']}", ""]
        L.append(f"- **Estado**: {f['estado']} · **fase**: {f['fase']} · **planes**: {', '.join(f['planes'])} · **desde**: {f['desde'] or '—'}")
        for titulo, clave in [("Límites", "limites"), ("Pasos", "pasos"), ("No hace", "no_hace"), ("Bloqueos", "bloqueos")]:
            if f.get(clave):
                L.append(f"- **{titulo}**: " + " · ".join(f[clave]))
        cl = f.get("claims") or {}
        if cl.get("permitidos"):
            L.append("- **Claims permitidos**: " + " · ".join(f"«{x}»" for x in cl["permitidos"]))
        if cl.get("prohibidos"):
            L.append("- **Claims prohibidos**: " + " · ".join(f"«{x}»" for x in cl["prohibidos"]))
        for cap in f.get("capturas") or []:
            L.append(f"- **Captura** ({cap['tipo']}, {cap['fecha']}): `{cap['archivo']}` · {cap['version']}")
        if f.get("notas"):
            L.append(f"- **Notas**: {f['notas']}")
        L.append("")

    L += ["## Lo que Kalmaa no hace", "", "| id | Qué | Estado | Por qué |", "|---|---|---|---|"]
    for n in c["no_hace"]:
        L.append(f"| `{n['id']}` | {celda(n['nombre'])} | {n['estado']} | {celda(n['motivo'])} |")

    L += ["", "## Fuentes", ""] + [f"- {s}" for s in c["fuentes"]]
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--salida")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    c = yaml.safe_load(CATALOGO.read_text(encoding="utf-8"))
    errores = validar(c)
    if errores:
        print("Errores en funcionalidades.yaml:", *errores, sep="\n  - ", file=sys.stderr)
        sys.exit(1)
    if a.check:
        print(f"OK: {len(c['funcionalidades'])} funcionalidades, {len(c['no_hace'])} en «no hace».")
        return
    md = ficha(c)
    if a.salida:
        Path(a.salida).write_text(md, encoding="utf-8")
        print(f"Ficha escrita en {a.salida}")
    else:
        sys.stdout.write(md)


if __name__ == "__main__":
    main()
