#!/usr/bin/python

from __future__ import print_function

import sys, os
import subprocess

## Dependencies:
## sox, libsox-fmt-mp3


def main():
	
	fgen = FreqGenerator()

	fgen.setFormat('mp3')
	fgen.setScale('harmonic')
	fgen.setPath('./samples')
	fgen.setInstrument('pluck')
	fgen.setNoteLength(0.1)
	
# Handle cmd line options
	
	if len(sys.argv) > 1:
		if sys.argv[1] == 'all':
			fgen.generate_all()
			exit()
		else:
			fgen.setScale(sys.argv[1])
	if len(sys.argv) > 2:
		fgen.setInstrument(sys.argv[2])	

	fgen.generate()
	

class FreqGenerator:	
	def generate_all(self):
		for scale in self._getAvailableScales():
			if scale == 'harmonic':
				freqs = self._harmonic()
			elif scale == 'pentatonic':
				freqs = self._pentatonic()
			elif scale == 'chromatic':
				freqs = self._chromatic()
			for instrument in self._getAvailableInstruments():
				for i,freq in enumerate(freqs):
					cmd = "sox -n {0}/{6}-{1}-{2}.{3} synth {4} {1} {5}".format(
						self.path,		#0
						instrument,	#1
						i,			#2
						self.format,		#3
						self.noteLength,	#4
						freq,			#5
						scale		#6
					)
					subprocess.call(cmd.split())
				pass	
	
	def generate(self):
		"""
		Generates an audio file for each frequency in a scale

		"""
		if self.scale == 'harmonic':
			freqs = self._harmonic()
		elif self.scale == 'pentatonic':
			freqs = self._pentatonic()
		elif self.scale == 'chromatic':
			freqs = self._chromatic()
		for i,freq in enumerate(freqs):
			cmd = "sox -n {0}/{6}-{1}-{2}.{3} synth {4} {1} {5}".format(
				self.path,		#0
				self.instrument,	#1
				i,			#2
				self.format,		#3
				self.noteLength,	#4
				freq,			#5
				self.scale		#6
			)
			subprocess.call(cmd.split())
	
	def setFormat(self, fileFormat='mp3'):
		"""
		:param fileFormat: the output file extension, e.g., mp3, wav
		"""
		assert fileFormat in self._getAvailableFormats(), "Invalid file format"
		self.format = fileFormat
	
	def setInstrument(self, instrument):
		assert instrument in self._getAvailableInstruments(), "Invalid instrument"
		self.instrument = instrument

	def setNoteLength(self, noteLength):
		self.noteLength = float(noteLength)

	def setPath(self, path):
		assert os.path.exists(path)
		self.path = path
	
	def setScale(self, scale):
		assert scale in self._getAvailableScales(), "Invalid scale."
		self.scale = scale
	
	def _getAvailableInstruments(self):
		return {'triangle', 'pluck', 'trapezium', 'sawtooth', 'square'}

	def _getAvailableFormats(self):
		return {'mp3', 'wav'}

	def _getAvailableScales(self):
		return {'harmonic', 'pentatonic', 'chromatic'}

	@staticmethod
	def _harmonic(root=220):
		"""	
		Returns a harmonic series, e.g.:
			A = 220 Hz
			A = 440 Hz
			E = 660 Hz
			A = 880 Hz
		:param root: The frequency on which the series will be based
		"""
		return [root*i for i in range(1,11)]
	
	@staticmethod
	def _pentatonic():
		"""
		Returns a list of frequencies of a pentatonic scale using just
		intonation.
			A  = 440 Hz
			B  = 495 Hz
			C# = 550 Hz
			E  = 660 Hz
			F# = 770 Hz
			A  = 880 Hz
		"""
		return [440, 495, 550, 660, 770, 880, 990, 1100, 1320, 1540]
	
	@staticmethod
	def _chromatic():
		"""
		Returns a list of frequencies in a 12-tone equal temprament
		scale.
			A  = 440
			A# = A + A
		"""
		freqs = [440]
		ratio = 2.0**(1/12.0)  # 12th root of 2
		for i in range(9):
			f = freqs[-1]*ratio
			freqs.append(f)
		return freqs
	
if __name__ == "__main__":
	main()
