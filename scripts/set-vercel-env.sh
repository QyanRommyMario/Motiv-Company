#!/bin/bash
# Quick script to set Vercel environment variables
# Run this in Git Bash or WSL

# Install Vercel CLI if not already installed
# npm i -g vercel

# Login to Vercel
vercel login

# Link to project
vercel link

# Set environment variables
vercel env add NEXTAUTH_SECRET production
# Paste: pkapjLG5+DUaY3yrjMKCfc80wexTamSWaVQFi8sxoKs=

vercel env add NEXTAUTH_URL production
# Paste: https://motivcompany.vercel.app

vercel env add DATABASE_URL production
# Paste: postgresql://postgres.aaltkprawfanoajoevcp:9O8VxKMNJHABzNXW@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Redeploy
vercel --prod
