import { FULL_TURN_DEGREES, PATH_DECIMALS, QUARTER_TURN_DEGREES } from './declarations';
import { TPoint } from './types';

/**
 * Builds path data in the SVG `d` syntax — plain text that an `<svg><path>` draws and that `new Path2D(text)` turns into a
 * canvas path. Commands chain; `toString()` gives the text.
 * @example
 * const arrow = new PathBuilder().moveTo(0, 0).lineTo(10, 5).lineTo(0, 10).close().toString() // "M0 0L10 5L0 10Z"
 */
class PathBuilder {
	readonly #commands: string[] = [];

	/** The point at `degrees` (0 = up, clockwise) and `radius` from a center. */
	static polar(center: TPoint, radius: number, degrees: number): TPoint {
		const radians = ((degrees - QUARTER_TURN_DEGREES) * Math.PI) / (FULL_TURN_DEGREES / 2);
		return { x: center.x + radius * Math.cos(radians), y: center.y + radius * Math.sin(radians) };
	}

	/** A closed (or open) polyline through the points. */
	static polygon(points: readonly TPoint[], closed = true): string {
		const builder = new PathBuilder();
		points.forEach((point, index) => (index === 0 ? builder.moveTo(point.x, point.y) : builder.lineTo(point.x, point.y)));
		if (closed && points.length > 0) builder.close();
		return builder.toString();
	}

	/** A rectangle with rounded corners (the radius is limited to half the shorter side). */
	static roundedRect(x: number, y: number, width: number, height: number, radius: number): string {
		const corner = Math.max(0, Math.min(radius, width / 2, height / 2));
		return new PathBuilder()
			.moveTo(x + corner, y)
			.lineTo(x + width - corner, y)
			.arcTo(corner, corner, 0, false, true, x + width, y + corner)
			.lineTo(x + width, y + height - corner)
			.arcTo(corner, corner, 0, false, true, x + width - corner, y + height)
			.lineTo(x + corner, y + height)
			.arcTo(corner, corner, 0, false, true, x, y + height - corner)
			.lineTo(x, y + corner)
			.arcTo(corner, corner, 0, false, true, x + corner, y)
			.close()
			.toString();
	}

	/** An arc of a circle from `startDegrees` to `endDegrees` (0 = up, clockwise) — gauges and progress rings. */
	static arc(center: TPoint, radius: number, startDegrees: number, endDegrees: number): string {
		const sweep = endDegrees - startDegrees;
		if (Math.abs(sweep) >= FULL_TURN_DEGREES) {
			const top = PathBuilder.polar(center, radius, 0);
			const bottom = PathBuilder.polar(center, radius, FULL_TURN_DEGREES / 2);
			return new PathBuilder().moveTo(top.x, top.y).arcTo(radius, radius, 0, false, true, bottom.x, bottom.y).arcTo(radius, radius, 0, false, true, top.x, top.y).toString();
		}
		const start = PathBuilder.polar(center, radius, startDegrees);
		const end = PathBuilder.polar(center, radius, endDegrees);
		return new PathBuilder().moveTo(start.x, start.y).arcTo(radius, radius, 0, Math.abs(sweep) > FULL_TURN_DEGREES / 2, sweep > 0, end.x, end.y).toString();
	}

	/** A pie slice from the center — pie charts. */
	static slice(center: TPoint, radius: number, startDegrees: number, endDegrees: number): string {
		const arc = PathBuilder.arc(center, radius, startDegrees, endDegrees);
		return `M${PathBuilder.number(center.x)} ${PathBuilder.number(center.y)}L${arc.slice(1)}Z`;
	}

	/** A regular star or polygon (`innerRadius` equal to `radius` gives a polygon). */
	static star(center: TPoint, points: number, radius: number, innerRadius: number): string {
		const vertices: TPoint[] = [];
		const step = FULL_TURN_DEGREES / (points * 2);
		for (let index = 0; index < points * 2; index++) vertices.push(PathBuilder.polar(center, index % 2 === 0 ? radius : innerRadius, index * step));
		return PathBuilder.polygon(vertices);
	}

	/** A number as path text, rounded and without trailing zeros. */
	static number(value: number): string {
		return String(Number(value.toFixed(PATH_DECIMALS)));
	}

	/** Starts a new sub-path at a point. */
	moveTo(x: number, y: number): this {
		return this.#push('M', x, y);
	}

	/** Straight line to a point. */
	lineTo(x: number, y: number): this {
		return this.#push('L', x, y);
	}

	/** Quadratic curve with one control point. */
	quadraticTo(controlX: number, controlY: number, x: number, y: number): this {
		return this.#push('Q', controlX, controlY, x, y);
	}

	/** Cubic curve with two control points. */
	cubicTo(firstX: number, firstY: number, secondX: number, secondY: number, x: number, y: number): this {
		return this.#push('C', firstX, firstY, secondX, secondY, x, y);
	}

	/** Elliptical arc to a point, as in SVG (`largeArc` and `sweep` pick which of the four possible arcs). */
	arcTo(radiusX: number, radiusY: number, rotation: number, largeArc: boolean, sweep: boolean, x: number, y: number): this {
		return this.#push('A', radiusX, radiusY, rotation, largeArc ? 1 : 0, sweep ? 1 : 0, x, y);
	}

	/** Closes the sub-path with a line to its start. */
	close(): this {
		this.#commands.push('Z');
		return this;
	}

	/** The path data. */
	toString(): string {
		return this.#commands.join('');
	}

	#push(command: string, ...values: number[]): this {
		this.#commands.push(command + values.map(PathBuilder.number).join(' '));
		return this;
	}
}

export { PathBuilder };
