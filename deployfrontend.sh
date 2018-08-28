rsync -r src/ docs/
rsync /build/contracts/InvestmentScreen.json docs/
git add .
git commit -m "adding frontend files to Github"
git push