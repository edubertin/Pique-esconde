# ADR-001 - App Stack Expo

## Status

Aceita.

## Contexto

O Pique Esconde precisa rodar em celular real com GPS, som, vibração, deep links e experiência mobile-first. Também é útil ter web para prototipação e validação visual.

## Decisão

Usar Expo + React Native + Expo Router com TypeScript.

## Consequências

- Permite iOS, Android e web com base compartilhada.
- Acelera o MVP.
- Aproveita experiência prévia do projeto com Expo/React Native.
- Exige teste cedo em celular real, porque web não valida completamente GPS/radar.

