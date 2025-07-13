#include "lote.hpp"

#include <whisper.h>

#include <memory>
#include <sstream>

class Transcriber
{
public:
    virtual ~Transcriber() = default;
    virtual std::string Transcribe(const float* audio_data, size_t audio_data_size) = 0;
};

using WhisperContextPtr = std::unique_ptr<whisper_context, decltype(&whisper_free)>;
using WhisperContextParamsPtr = std::unique_ptr<whisper_context_params, decltype(&whisper_free_context_params)>;
using WhisperFullParamsPtr = std::unique_ptr<whisper_full_params, decltype(&whisper_free_params)>;

class WhisperTranscriber : public Transcriber
{
public:
    WhisperTranscriber(const std::string& model_path
    ) : whisper_ctx_params_(whisper_context_default_params_by_ref(), &whisper_free_context_params),
        whisper_ctx_(nullptr, &whisper_free)
    {
        if (whisper_ctx_params_ == nullptr)
        {
            throw std::runtime_error("whisper_context_default_params_by_ref returned nullptr");
        }

        whisper_ctx_ = std::unique_ptr<whisper_context, decltype(&whisper_free)>(whisper_init_from_file_with_params(model_path.c_str(), *whisper_ctx_params_), &whisper_free);
        if (whisper_ctx_ == nullptr)
        {
            throw std::runtime_error("whisper_init_from_file_with_params returned nullptr");
        }
    }

    std::string Transcribe(const float* audio_data, size_t audio_data_size)
    {
        whisper_context *whisper_ctx = whisper_ctx_.get();
        WhisperFullParamsPtr whisper_full_params(whisper_full_default_params_by_ref(WHISPER_SAMPLING_BEAM_SEARCH), &whisper_free_params);
        if (whisper_full_params == nullptr)
        {
            throw std::runtime_error("whisper_full_default_params_by_ref returned nullptr");
        }

        if (whisper_full(whisper_ctx, *whisper_full_params, audio_data, audio_data_size) != 0)
        {
            throw std::runtime_error("whisper_full returned non-zero");
        }

        const int n_segments = whisper_full_n_segments(whisper_ctx);
        std::stringstream result;
        for (int i = 0; i < n_segments; ++i)
        {
            const char * text = whisper_full_get_segment_text(whisper_ctx, i);
            result << text << " ";
        }
        return result.str();
    }

private:
    WhisperContextParamsPtr whisper_ctx_params_;
    WhisperContextPtr whisper_ctx_;
};

std::string Transcribe(const std::string& model_path, const float* audio_data, size_t audio_data_size)
{
    WhisperTranscriber transcriber(model_path);
    return transcriber.Transcribe(audio_data, audio_data_size);
}