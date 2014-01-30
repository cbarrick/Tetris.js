.PHONY: docs

docs:
	rm -rf docs
	docco src/* REPORT.md
	mv docs/REPORT.html docs/index.html
