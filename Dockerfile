FROM python:3.13-slim AS builder

WORKDIR /opt/cutplanner

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock README.md ./
COPY src ./src

RUN uv sync --frozen --no-dev

FROM python:3.13-slim

RUN apt-get update \
    && apt-get install --no-install-recommends -y openscad \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 cutplanner \
    && mkdir /data \
    && chown cutplanner:cutplanner /data

COPY --from=builder /opt/cutplanner/.venv /opt/cutplanner/.venv
COPY --from=builder /opt/cutplanner/src /opt/cutplanner/src

ENV PATH="/opt/cutplanner/.venv/bin:${PATH}"
WORKDIR /data
USER cutplanner

EXPOSE 16080
VOLUME ["/data"]

ENTRYPOINT ["cutplanner", "serve"]
CMD ["/data/design.scad", "/data/inventory.yaml"]
